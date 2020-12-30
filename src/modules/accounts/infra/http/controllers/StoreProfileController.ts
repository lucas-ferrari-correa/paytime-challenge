import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import UpdateStoreProfileService from '@modules/accounts/services/UpdateStoreProfileService';
import ShowStoreProfileService from '@modules/accounts/services/ShowStoreProfileService';

export default class StoreProfileController {
  public async show(request: Request, response: Response): Promise<Response> {
    const account_id = request.account.id;

    const showStoreProfile = container.resolve(ShowStoreProfileService);

    const user = await showStoreProfile.execute({ account_id });

    return response.json(classToClass(user));
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const account_store_id = request.account.id;
    const {
      accountName,
      cnpj,
      accountUserId,
      old_password,
      password,
    } = request.body;

    const updateStoreProfile = container.resolve(UpdateStoreProfileService);

    const user = await updateStoreProfile.execute({
      account_store_id,
      accountName,
      cnpj,
      accountUserId,
      old_password,
      password,
    });

    return response.json(classToClass(user));
  }
}
