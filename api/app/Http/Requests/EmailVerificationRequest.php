<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Foundation\Auth\EmailVerificationRequest as CoreRequest;
class EmailVerificationRequest extends CoreRequest
{
    public function user($guard = null)
    {
        return User::find($this->route('id'));  
    }

}
