import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import UpdateUserProfileService from '@modules/accounts/services/UpdateUserProfileService';
import ShowUserProfileService from '@modules/accounts/services/ShowUserProfileService';

export default class UserProfileController {
  public async show(request: Request, response: Response): Promise<Response> {
    const account_id = request.account.id;

    const showUserProfile = container.resolve(ShowUserProfileService);

    const user = await showUserProfile.execute({ account_id });

    return response.json(classToClass(user));
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const account_user_id = request.account.id;
    const { accountName, email, cpf, old_password, password } = request.body;

    const updateUserProfile = container.resolve(UpdateUserProfileService);

    const user = await updateUserProfile.execute({
      account_user_id,
      accountName,
      cpf,
      email,
      old_password,
      password,
    });

    return response.json(classToClass(user));
  }
}
