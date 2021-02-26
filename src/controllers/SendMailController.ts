import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';

import SurveysRepository from '../repositories/SurveysRepository';
import SurveysUsersRepository from '../repositories/SurveysUsersRepository';
import UsersRepository from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';
import AppError from '../errors/AppError';

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const userAlreadyExists = await usersRepository.findOne({ email });

    if (!userAlreadyExists) {
      throw new AppError('User does not exists');
    }

    const surveyAlreadyExists = await surveysRepository.findOne({ id: survey_id });

    if (!surveyAlreadyExists) {
      throw new AppError('Survey does not exists');
    }

    const { title, description } = surveyAlreadyExists;
    const { id, name } = userAlreadyExists;

    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: { user_id: id, value: null },
      relations: ['user', 'survey'],
    });

    const variables = {
      name,
      title,
      description,
      id: '',
      link: process.env.URL_MAIL,
    };

    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;

      // Enviar email para o usuário
      await SendMailService.execute(email, title, variables, npsPath);
      return response.json(surveyUserAlreadyExists);
    }

    // Salvar informações na tabale SurveyUser
    const surveyUser = surveysUsersRepository.create({
      user_id: id,
      survey_id,
    });

    await surveysUsersRepository.save(surveyUser);

    variables.id = surveyUser.id;

    // Enviar email para o usuário
    await SendMailService.execute(email, title, variables, npsPath);

    return response.json(surveyUser);
  }
}

export default SendMailController;
