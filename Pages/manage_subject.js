import React, { Component } from 'react';
import {
  Container,
  Content,
  Body,
  Button,
  Header,
  Title,
  Text,
  Icon,
  List,
  ListItem} from 'native-base';
import {
  Alert,
  AlertIOS,
  View,
  ListView,
  StyleSheet
} from 'react-native';


// 科目一覧管理のコンポーネント
export default class ManageSubject extends Component {
  /**
   * コンストラクタ
   * @param {[type]} props 親コンポーネントから受け継ぐプロパティ。
   *                       データベースを操作するdbオブジェクトを受け継ぐ
   */
  constructor (props) {
    super(props)
    this.state = {
      subjects: []
    }
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
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

  /**
   * 科目を一覧から削除
   * @param  {Number} secId  リストのリフレッシュに使用される
   * @param  {Number} rowId  行番号
   * @param  {[type]} rowMap リストのリフレッシュに使用される
   */
  deleteSubject (secId, rowId, rowMap) {
    // データ削除
    this.props.db.deleteSubject(this.state.subjects[rowId].id)
    // 再度科目一覧を取得し、レンダリングをリフレッシュする
    rowMap[`${secId}${rowId}`].props.closeRow()
    this.fetchSubjects()
  }

  /**
   * 科目を一件登録する
   * @param {String} name 科目名
   */
  addSubject (name) {
    // 空文字じゃなければ科目追加し更新する
    if ("" !== name){
      if (!this.props.db.createSubject(name)) {
        Alert.alert("エラー", "すでに存在する科目名です", [
          {text: 'OK', onPress: () => {}},
        ])
      }
      this.fetchSubjects()
    }
  }

  /**
   * 科目を更新する
   * @param  {Number} id 科目データのID
   * @param  {String} name  科目名
   */
  updateSubject (id, name) {
    if ("" !== name) {
      this.props.db.addSubject(id, name)
      this.fetchSubjects()
    }
  }


/**************************************************************************
レンダリング関連
**************************************************************************/
  /**
   * 科目名を入力するダイアログを表示する
   */
  inputSubjectDialog () {
    AlertIOS.prompt("科目を追加", "科目名を入力してください", [
      {
        text: 'OK',
        onPress: (inputName) => this.addSubject(inputName),
      },
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel'
      },
    ],
    "plain-text")
  }

  /**
   * 科目名を変更するダイアログを表示する
   */
  updateSubjectDialog (subject) {
    AlertIOS.prompt("科目を変更", "科目名を入力してください", [
      {
        text: 'OK',
        onPress: (inputName) => this.updateSubject(subject.id, inputName),
      },
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel'
      },
    ],
    "plain-text",
    subject.name,)
  }

  /**
   * リストの一行をレンダリング
   * @param  {Object} subject 出力する科目
   * @return {Component}      リストの一行のコンポーネント
   */
  renderRow (subject) {
    return (
      <ListItem noIndent={true} onPress={() => this.updateSubjectDialog(subject)}>
        <Text style={styles.subjectName}>{subject.name}</Text>
      </ListItem>
    )
  }

  /**
   * リストの行を右スワイプした時に表示されるボタンのレンダリング
   * @param  {[type]} data   [description]
   * @param  {Number} secId  [description]
   * @param  {Number} rowId  行番号(0~)
   * @param  {[type]} rowMap [description]
   * @return {Component}        行の右に表示されるボタン
   */
  renderRightHidden (data, secId, rowId, rowMap) {
    return (
      <Button active full danger
        onPress={() => this.deleteSubject(secId, rowId, rowMap)}>
        <Icon active name="trash" />
      </Button>
    )
  }

  /**
   * 科目一覧画面のレンダリング。
   * stateが変更されたらシステムから自動で呼ばれる
   * @return {コンポーネント} レンダリングするコンポーネント
   */
  render () {
    // 科目一覧を取得していない、最新のデータではないなら取得する
    if (null === this.updatedDate || !this.props.db.isDBUpdated(this.updatedDate)) {
      this.fetchSubjects()
    }
    return (
      <View style={{flex: 1}}>
        <Container>
          <Header>
            <Body>
              <Title>科目一覧</Title>
            </Body>
          </Header>
          <Content>
            <List removeClippedSubviews={false}
              dataSource={this.ds.cloneWithRows(this.state.subjects)}
              renderRow={ data => this.renderRow(data) }
              renderRightHiddenRow={ (data, secId, rowId, rowMap) => this.renderRightHidden(data, secId, rowId, rowMap) }
              rightOpenValue={-70} />
          </Content>
        </Container>
        <View style={styles.addButton}>
          <Button rounded info
            onPress={e => this.inputSubjectDialog()}>
            <Icon name="ios-add"/>
          </Button>
        </View>
      </View>
    )
  }
}


/**
 * スタイルシート
 * @type {[type]}
 */
const styles = StyleSheet.create({
  /**
   * 科目追加ボタン。画面下部に固定させる
   * @type {Object}
   */
  addButton : {
    position: 'absolute',
    top: 400,
    bottom: 200,
    right: 30,
    flex: 1
  },

  subjectName: {
    fontSize: 18,
    paddingTop: 4,
    paddingBottom: 4,
  }
});
