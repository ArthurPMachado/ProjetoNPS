import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';

import SurveysRepository from '../repositories/SurveysRepository';
import SurveysUsersRepository from '../repositories/SurveysUsersRepository';
import UsersRepository from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const userAlreadyExists = await usersRepository.findOne({ email });

    if (!userAlreadyExists) {
      return response.status(400).json({
        error: 'User does not exists',
      });
    }

    const surveyAlreadyExists = await surveysRepository.findOne({ id: survey_id });

    if (!surveyAlreadyExists) {
      return response.status(400).json({
        error: 'Survey does not exists',
      });
    }

    const { title, description } = surveyAlreadyExists;
    const { id, name } = userAlreadyExists;

    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

    const variables = {
      name,
      title,
      description,
      user_id: id,
      link: process.env.URL_MAIL,
    };

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: [{ user_id: id }, { value: null }],
      relations: ['user', 'survey'],
    });

    if (surveyUserAlreadyExists) {
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

    // Enviar email para o usuário
    await SendMailService.execute(email, title, variables, npsPath);

    return response.json(surveyUser);
  }
}

export default SendMailController;
