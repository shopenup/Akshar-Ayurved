import {
  AuthenticatedShopenupRequest,
  ShopenupResponse,
} from '@shopenup/framework';
import { indexProductsWorkflow } from '../../../../workflows/index-products';

export async function POST(
  req: AuthenticatedShopenupRequest,
  res: ShopenupResponse,
): Promise<void> {
  const result = await indexProductsWorkflow(req.scope).run();

  res.json(result);
}
