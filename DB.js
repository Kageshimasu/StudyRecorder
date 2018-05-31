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
        seconds: 'int',
        date: 'date'
      }
    }
    this.realm = new Realm({schema: [SubjectSchema, StudySchema]})
    this.updatedDate = new Date()
  }


  /****************************************************************************
  科目データ関連
  ****************************************************************************/
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


  /****************************************************************************
  勉強時間関連
  ****************************************************************************/
  /**
   * 該当する科目、日付の勉強時間を取得する
   * 該当する科目がないならnullを返す
   * @param  {String} subject 科目名
   * @param  {Date} date    日付。時間・分・秒は使用しないので任意の数値で良い
   * @return {Number}         勉強時間の秒単位
   */
  getStudyTime (subject, date) {
    // 4時より前なら前の日付とする
    if (4 > date.getHours()) {
      date.setDate(date.getDate() - 1)
    }
    // 年月日以外は0にする
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    const subjectData = this.realm.objects("Subject").filtered("name = $0", subject)
    // 科目名が登録されていないならnullを返す
    if (0 === subjectData) {
      return null
    }
    const studyData = this.realm.objects("Study").filtered("subject_id = $0", subjectData[0].id).filtered("date = $0", date)
    // データが存在しなければ0を返す
    if (0 === studyData.length) {
      return 0
    }
    console.log("科目：" + subject + ", 秒数：" + studyData[0].seconds + ", 日付: " + date)
    return studyData[0].seconds
  }

  /**
   * 指定した科目・日付の勉強時間を追加・上書きする
   * 既存データがあれば上書きになる
   * @param {String} subject 科目名
   * @param {Date} date    勉強した日付
   * @param {Number} seconds 秒単位の勉強時間
   */
  setStudyTime (subject, date, seconds) {
    console.log("科目：" + subject + ", 秒数： + " + seconds + ", 日付: " + date)
    // 4時より前なら前の日付とする
    if (4 > date.getHours()) {
      date.setDate(date.getDate() - 1)
    }
    // 年月日以外は0にする
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    // 科目IDの取得
    const subject_id = this.realm.objects("Subject").filtered('name = $0', subject)[0].id
    // 追加・上書きするデータのIDを設定する
    let id = -1
    const studyData = this.realm.objects("Study").filtered("subject_id = $0", subject_id).filtered("date = $0", date)
    // 指定された科目・日付の勉強時間がないならidは新たに生成する
    if (0 === studyData.length) {
      id = this.realm.objects('Subject').max('id')
      // データが一件もなければ0にする
      if (undefined == id || null === id) {
        id = 0
      }
      id++
    } else {
      id = studyData[0].id
    }
    // データを登録・上書きする(idが既存のidなら上書きされる)
    this.realm.write(() => {
      this.realm.create('Study',
        {
          id: id,
          subject_id: subject_id,
          seconds: seconds,
          date: date
        },
      true)
    })
    // DBの更新日時を更新
    this.updatedDate = new Date()
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
