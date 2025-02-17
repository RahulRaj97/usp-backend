export interface JwtPayload {
  id: string;
  role: 'student' | 'admin' | 'agent' | 'sub-agent' | 'parent';
}
