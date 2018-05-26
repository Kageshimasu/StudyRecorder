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
      data: []
    }
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
    // 科目一覧を取得したかどうか
    this.isFetched = false
  }

/****************************************************************************
データ操作関連
****************************************************************************/
  /**
   * 科目一覧をデータベースから取得する
   */
  fetchSubject() {
    // 科目一覧を取得し、dataにname, idのみを持たせる
    this.setState({data: this.props.db.getSubject().map(function (d) {
      return {"name": d["name"], "id": d["id"]}
    })})
    this.isFetched = true
  }

  /**
   * 科目を一覧から削除
   * @param  {Number} secId  リストのリフレッシュに使用される
   * @param  {Number} rowId  行番号
   * @param  {[type]} rowMap リストのリフレッシュに使用される
   */
  deleteSubject (secId, rowId, rowMap) {
    // データ削除
    this.props.db.deleteSubject(this.state.data[rowId].id)
    // 再度科目一覧を取得し、レンダリングをリフレッシュする
    rowMap[`${secId}${rowId}`].props.closeRow()
    this.fetchSubject()
  }

  /**
   * 科目を一件登録する
   * @param {String} text 科目名
   */
  addSubject (text) {
    // 空文字じゃなければ科目追加し更新する
    if ("" !== text){
      this.props.db.addSubject(text)
      this.fetchSubject()
    }
  }


/**************************************************************************
レンダリング関連
**************************************************************************/
  /**
   * 科目名を入力するダイアログを表示する
   */
  inputSubject () {
    AlertIOS.prompt("科目を追加", "科目名を入力してください", [
      {
        text: 'OK',
        onPress: (inputText) => this.addSubject(inputText),
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
   * リストの一行をレンダリング
   * @param  {string} data 出力する文字列
   * @return {Component}      リストの一行のコンポーネント
   */
  renderRow (data) {
    return (
      <ListItem noIndent={true}>
        <Text>{data}</Text>
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
   * レンダリングメソッド。
   * stateが変更されたらシステムから自動で呼ばれる
   * @return {コンポーネント} レンダリングするコンポーネント
   */
  render () {
    if (!this.isisisFetched) {
      this.fetchSubject()
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
              dataSource={this.ds.cloneWithRows(this.state.data.map( function (d) { return d["name"] }))}
              renderRow={ data => this.renderRow(data) }
              renderRightHiddenRow={ (data, secId, rowId, rowMap) => this.renderRightHidden(data, secId, rowId, rowMap) }
              rightOpenValue={-70} />
          </Content>
        </Container>
        <View style={styles.addButton}>
          <Button rounded info
            onPress={e => this.inputSubject()}>
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
  }
});
