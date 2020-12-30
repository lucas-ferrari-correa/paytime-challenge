export default interface ICpfCnpjProvider {
  checkCpfFormat(cpf: string): Promise<boolean>;
  checkCnpjFormat(cnpj: string): Promise<boolean>;
}
