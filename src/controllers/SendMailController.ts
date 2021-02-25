import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
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

    // Salvar informações na tabale SurveyUser
    const surveyUser = surveysUsersRepository.create({
      user_id: userAlreadyExists.id,
      survey_id,
    });

    await surveysUsersRepository.save(surveyUser);

    const { title, description } = surveyAlreadyExists;

    // Enviar email para o usuário
    await SendMailService.execute(email, title, description);

    return response.json(surveyUser);
  }
}

export default SendMailController;
