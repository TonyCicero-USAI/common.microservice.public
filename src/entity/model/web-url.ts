import { Expose } from 'class-transformer';

export class WebUrl {
  @Expose()
  // Name
  name: string;

  @Expose()
  // Displayed name or label on GUI
  displayedName: string;

  @Expose()
  // Displayed image on GUI
  image: string;

  @Expose()
  // Web url
  uri: string;
}
