// データベースのライブラリ
const Realm = require('realm');

// 科目一覧・勉強時間データを操作さするクラス
export default class DB {
  /**
   * コンストラクタ
   * 科目、勉強時間のテーブル定義
   */
  constructor () {
    // 科目一覧テーブル
    const SubjectSchema = {
      name: 'Subject',
      primaryKey: 'id',
      properties : {
        id: 'int',
        name: 'string'
      }
    }
    // 勉強時間記録テーブル
    const StudySchema = {
      name: 'Study',
      primaryKey: 'id',
      properties: {
        id: 'int',
        subject_id: 'int',
        minutes: 'int',
        date: 'date'
      }
    }
    this.realm = new Realm({schema: [SubjectSchema, StudySchema]})
    this.updatedDate = new Date()
  }

  /**
   * 科目を登録する。
   * 科目名が重複したらfalseを返す
   * データが超過したらを返す
   * @param {String} name 科目名
   * @return {Boolean} 成功したらtrue、それ以外はfalse
   */
  createSubject(name) {
    // nameの重複チェック
    if (0 < this.realm.objects('Subject').filtered("name = '" + name + "'").length) {
      return false
    }
    // 現在のIDの最大値を取得
    let maxId = this.realm.objects('Subject').max('id')
    // データが存在しないならIDを0にする
    if (undefined === maxId || null === maxId) {
      maxId = 0
    }
    maxId += 1
    // 登録処理
    this.addSubject(maxId, name)
    return true
  }

  /**
   * 科目を登録、更新する
   * 引数のidが既存のidなら更新処理になる
   * @param {Number} id   科目のID
   * @param {String} name 科目名
   */
  addSubject (id, name) {
    this.realm.write(() => {
      const newSubject = this.realm.create('Subject',
        {
          id: id,
          name: name
        },
      true)
    })
    // DBの更新日時を更新
    this.updatedDate = new Date()
  }

  /**
   * 科目を削除する
   * @param  {Number} id 削除したい科目のid(SubjectSchema.id)
   */
  deleteSubject (id) {
    this.realm.write(() => {
      this.realm.delete(this.realm.objects('Subject').filtered("id = "+id))
    })
    // DBの更新日時を更新
    this.updatedDate = new Date()
  }

  /**
   * ID順にソートした(登録日時の照準)科目一覧を返す。
   * @return {Object} SubjectSchemaオブジェクトのリスト
   */
  getSubjects () {
    return this.realm.objects('Subject').sorted('id')
  }

  /**
   * 各コンポーネントの内部状態が最新のDBの状態と一致しているならtrue、そうでないならfalseを返す
   * @param  {Date}  updatedDate コンポーネントが最後にDBからデータを取得した時刻
   * @return {Boolean}             最新のDBの状態とコンポーネントの内部状態が一致しているならtrue
   *                                そうでないならfalse
   */
  isDBUpdated (updatedDate) {
    return updatedDate === this.updatedDate
  }

  /**
   * DBが最後に内容を更新した時刻を取得する
   * @return {Date} 内容を更新した時刻
   */
  getUpdatedDate () {
    return this.updatedDate
  }
}
