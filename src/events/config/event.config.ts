import { registerAs } from '@nestjs/config';

export default registerAs('eventConfig', () => ({
  limitApplyCountries: ['India', 'Japan'],
  limitApplyPerWeek: 3,
  maxReccurance: 4,
}));
