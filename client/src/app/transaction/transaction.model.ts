export const ResponseStatus = {
  SUCCESS : 'S',
  FAIL: 'F'
};

export interface IPaymentResponse {
  status: string;       // ResponseStatus
  code: string;         // stripe/snappay return code
  decline_code: string; // strip decline_code
  msg: string;          // stripe/snappay retrun message
  chargeId: string;     // stripe { chargeId:x }
  url: string;          // snappay {url: data[0].h5pay_url} //  { code, data, msg, total, psn, sign }
}

export const TransactionAction = {
  PAY_BY_CASH: { code: 'PBCH', name: 'client pay cash' },
  PAY_BY_CARD: { code: 'PBC', name: 'pay by card' },
  PAY_BY_WECHAT: { code: 'PBW', name: 'pay by wechat' },
  ORDER_FROM_MERCHANT: { code: 'OFM', name: 'duocun order from merchant' },
  ORDER_FROM_DUOCUN: { code: 'OFD', name: 'client order from duocun' },
  CANCEL_ORDER_FROM_MERCHANT: { code: 'CFM', name: 'duocun cancel order from merchant' },
  CANCEL_ORDER_FROM_DUOCUN: { code: 'CFD', name: 'client cancel order from duocun' },
  PAY_SALARY: { code: 'PS', name: 'pay salary' },
  PAY_MERCHANT: {code: 'PM', name: 'pay merchant'},
  PAY_OFFICE_RENT: { code: 'POR', name: 'pay office rent' },
  REFUND_EXPENSE: { code: 'RE', name: 'refund expense' },
  ADD_CREDIT_BY_CARD: { code: 'ACBC', name: 'client add credit by card' },
  ADD_CREDIT_BY_WECHAT: { code: 'ACBW', name: 'client add credit by WECHATPAY' },
  ADD_CREDIT_BY_CASH: { code: 'ACBCH', name: 'client add credit by cash' },
  TRANSFER: { code: 'T', name: 'transfer' },

  TEST: { code: 'TEST', name: 'test' }
};

export interface ITransaction {
  _id?: string;
  id?: string;
  fromId?: string;
  fromName?: string;
  toId?: string;
  toName?: string;
  type: string;
  amount: number;
  actionCode: string;
  orderType: string;

  note?: string;
  fromBalance?: number;
  toBalance?: number;
  created?: string;
  modified?: string;
}

export interface ITransactionData {
  _id?: string;
  date: Date;
  received: number;
  paid: number;
  balance: number;
  type: string; // credit is from, debit is to
  id?: string;
  name?: string;
}
