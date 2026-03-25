export type GenericResponse = {
  code: number;
  success: boolean;
  message: string;
  data: any;
  jwt?: string;
  redirect: string | null;
};

