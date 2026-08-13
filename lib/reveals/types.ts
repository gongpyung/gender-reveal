export type Gender = "son" | "daughter";

export type RevealInput = {
  babyNickname: string;
  dueDate: string;
  recipientName: string;
  babyGender: Gender;
};

export type RevealRecord = RevealInput & {
  token: string;
  createdAt: Date;
};
