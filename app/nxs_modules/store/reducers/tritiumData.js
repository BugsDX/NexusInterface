import * as TYPE from 'actions/actiontypes';

const initialState = {
  tritiumAccounts: [],
  userGenesis:
    '0000000000000000000000000000000000000000000000000000000000000000',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.TRITIUM_ACCOUNTS_LIST:
      return { tritiumAccounts: action.payload };
    case TYPE.TRITIUM_SET_USER_GENESIS:
      return { ...state, userGenesis: action.payload };
    default:
      return state;
  }
};
