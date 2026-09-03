export interface Brand {
  idMarca: string;
  nombre: string;
  estado: boolean;
  idUsuarioSolicitante: string | null;
  emailUsuarioSolicitante: string | null;
  createdAt: string;
}