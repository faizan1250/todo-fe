export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
   MainDrawer: undefined; // ✅ New root
   TodoModule: undefined;
  Home: undefined;
  Friends: undefined;
  AddFriend: undefined;  // or params if needed, but here undefined
  NicknameModal:  { friendId: string };
  ChallengeDetail: { challengeId: string };
  ChallengeList: undefined;  
    CreateChallenge: undefined;   
 
};

export type RootDrawerParamList = {
  Home: undefined;
  Timer: undefined;
  Deen: undefined;
  // add other drawer routes if any
};
