import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analyze')
export class AnalysisController {
  constructor(private readonly service: AnalysisService) {}

  @Post()
  async analyze(@Body() body: any) {
    return this.service.analyze(body);
  }
}
