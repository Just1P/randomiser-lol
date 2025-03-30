import { Role } from "@/enums/role";

export interface Player {
  id: string;
  name: string;
  role?: Role;
  champion?: string;
} 