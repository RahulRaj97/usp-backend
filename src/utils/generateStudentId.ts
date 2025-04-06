import StudentModel from '../models/studentModel';

export const generateStudentId = async (
  countryCode: string,
): Promise<string> => {
  const regex = new RegExp(`^${countryCode}(\\d{6})$`);

  const lastStudent = await StudentModel.find({ studentId: regex })
    .sort({ studentId: -1 })
    .limit(1);

  let nextNumber = 1;

  if (lastStudent.length > 0) {
    const lastId = lastStudent[0].studentId;
    const numberPart = parseInt(lastId.slice(countryCode.length), 10);
    nextNumber = numberPart + 1;
  }

  const paddedNumber = String(nextNumber).padStart(6, '0');
  return `${countryCode}${paddedNumber}`;
};
