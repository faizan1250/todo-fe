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
  EditChallenge: {
  challenge: {
    _id: string;
    title: string;
    description?: string;
    totalHours: number;
    durationDays: number;
    totalPoints: number;
    startDate: string;
    hashtags?: string[];
    status: string;
    creator: string | { _id: string; name?: string }; 
  };
};


 
};

export type RootDrawerParamList = {
  Home: undefined;
  Timer: undefined;
  Deen: undefined;
  // add other drawer routes if any
};
export type EditChallengeParamList = {
  EditChallenge: {
    challenge: {
      _id: string;
      title: string;
      description?: string;
      totalHours: number;
      durationDays: number;
      totalPoints: number;
      startDate: string;
      hashtags?: string[];
      status: string;
      creator: string;
    };
  };
};

