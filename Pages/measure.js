import React, { Component } from 'react'
import {
  Text,
  StyleSheet,
  Picker,
  View,
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
} from 'native-base';


export default class Measure extends Component {
  constructor (props) {
    super(props)
    // 科目選択初期値
    this.DEFAULT_SELECTED_ROWID = -1;
    this.state = {
      selectedRowId: this.DEFAULT_SELECTED_ROWID,
      subjects: [],
      measuring: false,
    }
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
    this.setState({subjects: this.props.db.getSubjects().map(function (d) {
      return {"name": d["name"], "id": d["id"]}
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
    if (this.state.selectedRowId !== -1) {
      this.setState({measuring: true})
    }
  }

  /**
   * 勉強時間計測を停止する
   */
  stopTimer () {
    if (this.state.selectedRowId !== -1) {
      this.setState({measuring: false})
    }
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
        <Picker onValueChange={ (itemValue) => { this.setState({selectedRowId: itemValue}) } }
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
          {subjectBlock}
          <View style={styles.toggleButton}>
            {this.renderToggleButton()}
          </View>
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
  }
});
