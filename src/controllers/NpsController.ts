import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import SurveysRepository from '../repositories/SurveysRepository';
import SurveysUsersRepository from '../repositories/SurveysUsersRepository';

class NpsController {
  async execute(request: Request, response: Response) {
    const { survey_id } = request.params;

    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveysUsers = await surveysUsersRepository.find({
      survey_id,
    });

    const detractors = surveysUsers.filter(
      (survey) => (survey.value >= 0 && survey.value <= 6),
    ).length;

    const promoters = surveysUsers.filter(
      (survey) => (survey.value >= 9 && survey.value <= 10),
    ).length;

    const passives = surveysUsers.filter(
      (survey) => (survey.value >= 7 && survey.value <= 8),
    ).length;

    const totalAnswers = surveysUsers.length;

    const calculateNps = (promoters - detractors) / totalAnswers;

    return response.json({
      detractors,
      promoters,
      passives,
      totalAnswers,
      nps: calculateNps,
    });
  }
}

export default NpsController;