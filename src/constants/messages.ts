export const messages = {
  common: {
    errorMessage: {
      unauthorized: "認証に失敗しました。",
      forbidden: "権限がありません。",
      notFound: "リソースが見つかりません。",
      conflict: "競合が発生しました。",
      unprocessableEntity: "不正なリクエストです。",
      internalServerError: "サーバーエラーが発生しました。",
      otherError: "リクエストに失敗しました。",
      error: "エラーが発生しました。",
      claudeContentsError: "予期しないコンテンツタイプです",
    },

    validation: {
      required: "必須項目です",
      invalidEmail: "メールアドレスの形式が正しくありません",
      minLength: (length: number) => `${length}文字以上で入力してください`,
      maxLength: (length: number) => `${length}文字以内で入力してください`,
    },

    button: {
      submit: "送信",
      save: "保存",
      cancel: "キャンセル",
      back: "戻る",
      search: "検索",
    },

    loading: {
      submitting: "送信中...",
      loading: "読み込み中...",
    },

    success: {
      created: "登録が完了しました。",
      updated: "更新が完了しました。",
      deleted: "削除が完了しました。",
    },
  },

  employee: {
    employeeNumber: "社員番号",
    name: "氏名",
    frameWork: "言語・フレームワーク",
    projectValue: "単価（円）",
    condition: "状態",
    register: "社員登録",
    registerButton: "登録する",
  },

  login: {
    email: "メールアドレス",
    emailPlaceholder: "メールアドレスを入力",
    password: "パスワード",
    passwordPlaceholder: "パスワードを入力",
    login: "ログイン",
    forgotPassword: "パスワードを忘れた方はこちら",

    error: {
      loginFailed: "メールアドレスまたはパスワードが正しくありません。",
    },
  },
};
