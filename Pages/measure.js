import React, { Component } from 'react'

import {
  Text,
  StyleSheet,
  Picker,
  View,
  Linking,
} from 'react-native';

import {
  Container,
  Content,
  Body,
  Button,
  Header,
  Title,
  List,
  ListItem,
  Icon,
  Right,
} from 'native-base';

sprintf = require('sprintf').sprintf
import config from "../config.json"


export default class Measure extends Component {
  constructor (props) {
    super(props)

    // 科目選択初期値
    this.DEFAULT_SELECTED_ROWID = -1;
    this.state = {
      selectedRowId: this.DEFAULT_SELECTED_ROWID,
      subjects: [],
      measuring: false,
      studyTime: 0
    }

    // タイマーオブジェクトのID
    this.timerId = null

    // 科目一覧を取得、同期した時刻
    this.updatedDate = null
  }


  /****************************************************************************
  科目データ操作関連
  ****************************************************************************/
  /**
   * 科目一覧をデータベースから取得する
   */
  fetchSubjects() {
    // 科目一覧を取得し、dataにname, idのみを持たせる
    this.setState(
      {subjects: this.props.db.getSubjects().map(function (d) {
      return {"name": d["name"], "id": d["id"]
    }
    })})
    // 同期時刻を最新にする
    this.updatedDate = this.props.db.getUpdatedDate()
  }


  /****************************************************************************
  時間計測操作関連
  ****************************************************************************/
  /**
   * 勉強時間計測を開始する
   */
  startTimer () {
    if ((this.DEFAULT_SELECTED_ROWID !== this.state.selectedRowId) && (null === this.timerId)) {
      this.setState({measuring: true})

      // １秒ごとタイマーを更新する
      this.timerId = setInterval(function() {
        this.setState({studyTime: this.state.studyTime + 1})
      }.bind(this), 1000)
    }
  }

  /**
   * 勉強時間計測を停止する
   */
  stopTimer () {
    if (this.DEFAULT_SELECTED_ROWID !== this.state.selectedRowId) {

      this.props.db.setStudyTime(
        this.state.subjects[this.state.selectedRowId].name,
        new Date(),
        this.state.studyTime
      )
      this.setState({measuring: false})

      // タイマーを止める
      clearTimeout(this.timerId)
      this.timerId = null;
    }
  }

  /**
   * 勉強した内容をツイートする画面を表示する
   */
  tweetStudy () {
    let hours = Math.floor(this.state.studyTime / (60 * 60))
    let minutes = Math.floor((this.state.studyTime / 60) % 60)
    let text = this.state.subjects[this.state.selectedRowId].name + "を"
    if (0 !== hours) {
      text += hours + "時間"
    }
    if (0 !== minutes) {
      text += minutes + "分"
    }
    text += "勉強しました。"
    url  = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&hashtags=" + encodeURIComponent(config.hashtag)
    Linking.openURL(url);
  }

  /**
   * 科目変更時の処理
   * 今日勉強した科目なら時間を引き継ぐ
   * @param  {Number} rowId 科目一覧配列のデータ番号
   */
  changeSubject (rowId) {
    // 科目が選択されたらその科目の勉強時間を取得する
    let studyTime = 0
    if (this.DEFAULT_SELECTED_ROWID !== rowId) {
      studyTime = this.props.db.getStudyTime(this.state.subjects[rowId].name, new Date())
    }
    this.setState({studyTime: studyTime, selectedRowId: rowId})
  }

  /**************************************************************************
  レンダリング関連
  **************************************************************************/
  /**
   * 科目一覧用の科目データのレンダリング
   * @param  {Object} subject 科目データ。科目名name、idを持つ
   * @param  {Number} index   科目データの配列のインデックス
   * @return {Component}         科目データをレンダリングしたコンポーネント
   */
  renderPickerItem (subject, index) {
    return (
      <Picker.Item label={subject.name} key={index} value={index} />
    )
  }

  /**
   * 科目が登録されていない場合の科目表示欄のレンダリング
   * @return {Component} 科目が登録されていない場合の科目表示コンポーネント
   */
  renderNoSubjectBlock () {
    return (
      <View style={styles.subjectNameBox}>
        <Text style={styles.subjectName}>科目を登録してください</Text>
      </View>
    )
  }

  /**
   * 勉強時間計測ボタンのレンダリング
   * @return {Component} 計測開始・終了ボタンのコンポーネント
   */
  renderToggleButton () {
    return (
      this.state.measuring?
        <Button block danger disabled={this.DEFAULT_SELECTED_ROWID === this.state.selectedRowId}
          onPress={() => this.stopTimer()}>
          <Text style={styles.buttonText}>STOP</Text>
        </Button>
         :
        <Button block success disabled={this.DEFAULT_SELECTED_ROWID === this.state.selectedRowId}
          onPress={() => this.startTimer()}>
          <Text style={styles.buttonText}>START</Text>
        </Button>
    )
  }

  /**
   * タイマー部分のレンダリング
   * @return {Component} タイマー部分のコンポーネント
   */
  renderTimer () {
    let hours = sprintf("%d", Math.floor(this.state.studyTime / (60 * 60)))
    let minutes = sprintf("%02d", Math.floor((this.state.studyTime / 60) % 60))
    let seconds = sprintf("%02d", this.state.studyTime % 60)
    return (
      <View style={styles.timer} >
        <Text style={styles.timerText}>{ hours + " : " + minutes + " : " + seconds}</Text>
      </View>
    )
  }

  /**
   * ツイートボタンのレンダリング
   * @return {Component} ツイートボタンのコンポーネント
   */
  renderTweetButton () {
    // 勉強時間が0もしくは科目が選択されていないならツイートボタンを無効にする
    let disabled = (0 === this.state.studyTime) || (-1 === this.state.selectedRowId)
    // 計測中でなければレンダリングする
    return (
      this.state.measuring? <View /> :
      <View style={styles.tweetButtonView}>
        <Button iconLeft disabled={disabled} onPress={() => this.tweetStudy()}>
          <Icon type="FontAwesome" name='twitter' />
          <Text style={styles.tweetButtonText}>　ツイートする　</Text>
        </Button>
      </View>
    )
  }


  /**
   * 時間計測画面のレンダリング。
   * stateが変更されたらシステムから自動で呼ばれる
   * @return {コンポーネント} レンダリングするコンポーネント
   */
  render () {
    // 科目一覧を取得していない、最新のデータではないなら取得する
    if (null === this.updatedDate || !this.props.db.isDBUpdated(this.updatedDate)) {
      this.fetchSubjects()
    }

    // 科目選択、表示コンポーネント
    let subjectBlock = ""
    // データがないなら科目名を登録してくださいと表示する
    if (0 == this.state.subjects.length) {
      subjectBlock = this.renderNoSubjectBlock()
    }
    else {
      // 計測中なら科目名を表示
      // 計測前なら科目一覧から選択
      subjectBlock = this.state.measuring?
        <View style={styles.subjectNameBox}>
          <Text style={styles.subjectName}>
            { this.state.subjects[this.state.selectedRowId].name }
          </Text>
          <Text/>
          <Text/>
          <Text style={styles.subjectName}>{ "計測中" }</Text>
        </View>
        :
        <Picker onValueChange={ (itemValue) => this.changeSubject(itemValue) }
          iosHeader="選択してください" mode="dropdown"
          selectedValue={this.state.selectedRowId}
          enabled={this.DEFAULT_SELECTED_ROWID === this.state.selectedRowId}>
            <Picker.Item key={'unselectable'} label={"--科目名を選択してください--"}
              value={this.DEFAULT_SELECTED_ROWID} />
            { this.state.subjects.map((subject, index) => {
                return this.renderPickerItem(subject, index)
              }) }
        </Picker>
    }

    return (
      <Container>
        <Header>
          <Body>
            <Title>勉強時間計測</Title>
          </Body>
        </Header>
        <Content>
          { subjectBlock }
          { this.renderTimer() }
          <View style={styles.toggleButton}>
            {this.renderToggleButton()}
          </View>
          { this.renderTweetButton() }
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  subjectName: {
    fontSize: 22,
  },
  subjectNameBox: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  toggleButton: {
    marginTop: 20,
  },
  buttonText: {
    fontSize: 22,
    color: "white",
  },
  timer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 60,
    color: "black",
  },

  // ツイートボタンのView
  tweetButtonView: {
    alignItems: 'center',
    marginTop: 30,
  },
  // ツイートボタン内のテキスト
  tweetButtonText: {
    fontSize: 18,
    color: "white",
  }
});
