import * as TYPE from 'actions/actiontypes';

const initialState = {
  tritiumAccounts: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.TRITIUM_ACCOUNTS_LIST:
      return { tritiumAccounts: action.payload };

    default:
      return state;
  }
};
