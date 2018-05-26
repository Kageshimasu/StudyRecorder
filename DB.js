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
  }

  /**
   * 科目を登録する。
   * 科目名が重複したらfalseを返す
   * データが超過したらを返す
   * @param {String} name 科目名
   * @return {Boolean} 成功したらtrue、それ以外はfalse
   */
  addSubject(name) {
    // nameの重複チェック
    if (this.realm.objects('Subject').filtered("name = '${name}'").length > 0) {
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
    this.realm.write(() => {
      const newSubject = this.realm.create('Subject',
        {
          id: maxId,
          name: name
        })
    })
    return true
  }

  /**
   * 科目を削除する
   * @param  {Number} id 削除したい科目のid(SubjectSchema.id)
   */
  deleteSubject (id) {
    this.realm.write(() => {
      this.realm.delete(this.realm.objects('Subject').filtered("id = "+id))
    })
  }

  /**
   * ID順にソートした(登録日時の照準)科目一覧を返す。
   * @return {Object} SubjectSchemaオブジェクトのリスト
   */
  getSubject () {
    return this.realm.objects('Subject').sorted('id')
  }
}
