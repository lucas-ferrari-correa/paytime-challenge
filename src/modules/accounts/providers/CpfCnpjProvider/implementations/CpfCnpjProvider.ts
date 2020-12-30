import ICpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/models/ICpfCnpjProvider';

export default class CpfCnpjProvider implements ICpfCnpjProvider {
  public async checkCpfFormat(cpf: string): Promise<boolean> {
    const cpfSplitted = cpf.split('');
    const cpfFirst9Characters = cpfSplitted.slice(0, 9);
    const cpfLast2Characters = cpfSplitted.slice(9, 11);

    const cpfMultipliedFirst9Characters = cpfFirst9Characters.map(
      (character, i) => {
        const multipliedCharacter = Number(character) * (10 - i);

        return multipliedCharacter;
      },
    );

    const cpfMultipliedFirst9CharactersSum = cpfMultipliedFirst9Characters.reduce(
      (accumulator: number, character: number) => {
        const result = accumulator + character;
        return result;
      },
      0,
    );

    const cpfMultipliedFirst9CharactersSumRest =
      cpfMultipliedFirst9CharactersSum % 11;

    const cpfFirstVerifiedDigit =
      cpfMultipliedFirst9CharactersSumRest < 2
        ? 0
        : 11 - cpfMultipliedFirst9CharactersSumRest;

    const cpfFirst9CharactersWithFirstVerifiedDigit = cpfFirst9Characters.concat(
      String(cpfFirstVerifiedDigit),
    );

    const cpfMultipliedFirst9CharactersWithFirstVerifiedDigit = cpfFirst9CharactersWithFirstVerifiedDigit.map(
      (character, i) => {
        const multipliedCharacter = Number(character) * (11 - i);

        return multipliedCharacter;
      },
    );

    const cpfMultipliedFirst9CharactersWithFirstVerifiedDigitSum = cpfMultipliedFirst9CharactersWithFirstVerifiedDigit.reduce(
      (accumulator: number, character: number) => {
        const result = accumulator + character;
        return result;
      },
      0,
    );

    const cpfMultipliedFirst9CharactersWithFirstVerifiedDigitSumRest =
      cpfMultipliedFirst9CharactersWithFirstVerifiedDigitSum % 11;

    const cpfSecondVerifiedDigit =
      cpfMultipliedFirst9CharactersWithFirstVerifiedDigitSumRest < 2
        ? 0
        : 11 - cpfMultipliedFirst9CharactersWithFirstVerifiedDigitSumRest;

    if (
      Number(cpfLast2Characters[0]) === cpfFirstVerifiedDigit &&
      Number(cpfLast2Characters[1]) === cpfSecondVerifiedDigit
    ) {
      return true;
    }
    return false;
  }

  public async checkCnpjFormat(cnpj: string): Promise<boolean> {
    const cnpjSplitted = cnpj.split('');
    const cnpjFirst12Characters = cnpjSplitted.slice(0, 12);
    const cnpjLast2Characters = cnpjSplitted.slice(12, 14);

    const cnpjMultipliedFirst12Characters = cnpjFirst12Characters.map(
      (character, i) => {
        const cnpjTable = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        const multipliedCharacter = Number(character) * cnpjTable[i];

        return multipliedCharacter;
      },
    );

    const cnpjMultipliedFirst12CharactersSum = cnpjMultipliedFirst12Characters.reduce(
      (accumulator: number, character: number) => {
        const result = accumulator + character;
        return result;
      },
      0,
    );

    const cnpjMultipliedFirst12CharactersSumRest =
      cnpjMultipliedFirst12CharactersSum % 11;

    const cnpjFirstVerifiedDigit =
      cnpjMultipliedFirst12CharactersSumRest < 2
        ? 0
        : 11 - cnpjMultipliedFirst12CharactersSumRest;

    const cnpjFirst12CharactersWithFirstVerifiedDigit = cnpjFirst12Characters.concat(
      String(cnpjFirstVerifiedDigit),
    );

    const cnpjMultipliedFirst12CharactersWithFirstVerifiedDigit = cnpjFirst12CharactersWithFirstVerifiedDigit.map(
      (character, i) => {
        const cnpjTable = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        const multipliedCharacter = Number(character) * cnpjTable[i];

        return multipliedCharacter;
      },
    );

    const cnpjMultipliedFirst12CharactersWithFirstVerifiedDigitSum = cnpjMultipliedFirst12CharactersWithFirstVerifiedDigit.reduce(
      (accumulator: number, character: number) => {
        const result = accumulator + character;
        return result;
      },
      0,
    );

    const cnpjMultipliedFirst12CharactersWithFirstVerifiedDigitSumRest =
      cnpjMultipliedFirst12CharactersWithFirstVerifiedDigitSum % 11;

    const cnpjSecondVerifiedDigit =
      cnpjMultipliedFirst12CharactersWithFirstVerifiedDigitSumRest < 2
        ? 0
        : 11 - cnpjMultipliedFirst12CharactersWithFirstVerifiedDigitSumRest;

    if (
      Number(cnpjLast2Characters[0]) === cnpjFirstVerifiedDigit &&
      Number(cnpjLast2Characters[1]) === cnpjSecondVerifiedDigit
    ) {
      return true;
    }
    return false;
  }
}
