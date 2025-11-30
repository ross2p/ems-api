import { PageRequest } from 'src/utils/pageables/page-request.utils';

export class EventFilterDto extends PageRequest {
  search: string;
}
