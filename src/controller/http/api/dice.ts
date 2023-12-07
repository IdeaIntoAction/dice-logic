import { EmptyObject, IRequest, IResponse } from '../../../@types/express/interface';
import { IPlayRequest, IPlayResponse } from '../../../schema/play';
import { RabbitService } from '../../../service/rabbit/rabbit';

export class DiceController {
  entry: (
    req: IRequest<EmptyObject, IPlayRequest>,
    res: IResponse<IPlayResponse>,
  ) => Promise<IResponse<IPlayResponse>> = async (_req, res) => {
    const rabbit = await RabbitService.getInstance();

    const request = {
      id: '123',
      nickname: 'test',
    }

    const result = await rabbit.getDiceResult(request);

    const response = {
      data: result
    }

    return res.send(response);
  }
}
export const diceController = new DiceController();
