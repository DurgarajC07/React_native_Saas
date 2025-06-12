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

    private function deductCredits(string $operation): void
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

    private function deductCredits(string $operation): void
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
