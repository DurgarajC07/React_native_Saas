<?php

namespace App\Http\Controllers;

use App\Enums\OperationEnum;
use App\Models\Image;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Transformation\AspectRatio;
use Cloudinary\Transformation\Background;
use Cloudinary\Transformation\Resize;
use Cloudinary\Asset\Image as CloudinaryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    public function fill(Request $request)
    {
        $operation = OperationEnum::GENERATIVE_FILL;
        $this->checkCredits($operation);

        $request->validate([
            'image' => 'required|image|max:10240',
            'aspectRatio' => 'required|string'
        ]);

        $image = $request->file('image');
        $aspectRatio = $request->input('aspectRatio');

        $aspectRatioMethod = $this->getAspectRatioMethod($aspectRatio);
        
        $originalPublicId = $image->store('uploads');

        $imageSize = getimagesize($image);
        $originalWidth = $imageSize[0];
        $originalHeight = $imageSize[1];

        $pad = Resize::pad();
        if (in_array($aspectRatio, ['16:9','4:3'])){
            $pad->height($originalHeight);
        } else {
            $pad->width($originalWidth);
        }
        $generatedImage = (new CloudinaryImage($originalPublicId))->resize(
            $pad->aspectRatio(AspectRatio::{$aspectRatioMethod}())
            ->background(Background::generativeFill())
            );

        $transformedImageUrl = $generatedImage->toUrl();

        $uploadResult = (new UploadApi())->upload($transformedImageUrl,
        [
            'folder' => 'transformed/gen_fill',
            // 'public_id' => $image->getClientOriginalName(),
        ]);

        $uploadedImageUrl = $uploadResult['secure_url'];
        $transformedPublicId = 'uploads/' . $uploadResult['public_id'];

        $this->saveImageOperation(
            $originalPublicId,
            Storage::url($originalPublicId),
            $transformedPublicId,
            $uploadedImageUrl,
            OperationEnum::GENERATIVE_FILL->value,
            ['aspect_ratio'=> $aspectRatio]
        );

        $this->deductCredits($operation);

        return response()->json([
            'message' => 'Image Uploaded and transformed sucessfully',
            'transformed_url' => $transformedImageUrl,
            'credits' => request()->user()->credits,
            'aspectRatio'=> $aspectRatio
        ]);
    }

    public function getLatestOperations(Request $request)
    {
        $user = $request->user();
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        $operations = Image::where('user_id', $user->id)->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
        
        $operations->getCollection()->transform(function ($operation){
            $operationType = $operation->operation_type;
            $enumType = match ($operationType) {
                'generative_fill' => OperationEnum::GENERATIVE_FILL,
                'restore' => OperationEnum::RESTORE,
                'recolor' => OperationEnum::RECOLOR,
                'remove_object' => OperationEnum::REMOVE_OBJECT,
                default => null
            };

            $operation->credits_used = $enumType ? $enumType->credits():0;
            return $operation;
        });

        return response()->json([
            'operations' => $operations->items(),
            'pagination' => [
            'total' => $operations->total(),
            'per_page' => $operations->perPage(),
            'current_page' => $operations->currentPage(),
            'last_page' => $operations->lastPage(),
            'has_more_pages' => $operations->hasMorePages(),
            ],
        ]);
    }

    public function getOperation($id)
    {
        $user = auth()->user();
        $operation = Image::where('user_id', $user->id)->where('id', $id)->firstOrFail();

        $operationType = $operation->operation_type;
        $enumType = match ($operationType) {
            'generative_fill' => OperationEnum::GENERATIVE_FILL,
            'restore' => OperationEnum::RESTORE,
            'recolor' => OperationEnum::RECOLOR,
            'remove_object' => OperationEnum::REMOVE_OBJECT,
            default => null
        };

        $operation->credits_used = $enumType ? $enumType->credits():0;

        return response()->json([
            'operation' => $operation
        ]);
    }

    public function deleteOperation($id)
    {
        $user = auth()->user();
        $operation = Image::where('user_id', $user->id)->where('id', $id)->firstOrFail();

        try {
            if($operation->original_image_public_id) {
                (new \Cloudinary\Api\Admin\AdminApi())->deleteAssets(publicIds: [$operation->original_image_public_id]);
            }
            if($operation->generated_image_public_id) {
                (new \Cloudinary\Api\Admin\AdminApi())->deleteAssets(publicIds: [$operation->generated_image_public_id]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to delete assets from Cloudinary: ' . $e->getMessage());
        }
        $operation->delete();

        return response()->json([
            'message' => 'Operation deleted successfully',
        ]);
    }

    private function saveImageOperation(string $originalPublicId, string $originalImageUrl, string $transformedPublicId, string $transformedImageUrl, string $operationType, array $operationMetadata = [])
    {
        Image::create([
            'user_id' => request()->user()->id,
            'original_image_public_id' => $originalPublicId,
            'original_image' => $originalImageUrl,
            'generated_image_public_id' => $transformedPublicId,
            'generated_image' => $transformedImageUrl,
            'operation_type' => $operationType,
            'operation_metadata' => $operationMetadata,
        ]);
    }

    private function checkCredits(OperationEnum $operation): void
    {
        $user = request()->user();
        $requiredCredits = $operation->credits();

        if ($user->credits < $requiredCredits) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                response()->json([
                    'message' => "Insufficient credits. This operation requires {$requiredCredits} credits. You have {$user->credits} credits.",
            ], 403)
            );
        }
    }

    private function deductCredits(OperationEnum $operation): void
    {
        $user = auth()->user();
        $user->credits -= $operation->credits();
        $user->save();
    }

    private function getAspectRatioMethod(string $ratio): string
    {
        return match ($ratio) {
            '16:9' => 'ar16x9',
            '4:3' => 'ar4x3',
            '1:1' => 'ar1x1',
            default => 'ar1x1'
        };
    }
   
}
