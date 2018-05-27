import { AppRegistry } from 'react-native'
import { TabNavigator } from 'react-navigation'
import React from 'react'
import {
  Icon,
} from 'native-base';

// データベース操作クラス
import DB from "./DB.js"
// 各ページ読み込み
import Measure from "./Pages/measure.js"
import Analysis from "./Pages/analysis.js"
import ManageSubject from "./Pages/manage_subject.js"
import Settings from "./Pages/settings.js"


const style = {
  noForcused: {
    color: "silver",
  },
  Forcused: {
    color: "black",
  },
  iconSize: 20,
}

// データベース操作オブジェクト
const db = new DB()

// タブ生成
const Home = TabNavigator(
  {
    // 勉強時間を計測する
    Page1: {
      screen: () => { return <Measure db={db} /> },
      navigationOptions: {
        title: '時間計測',
        tabBarIcon: ({focused, tintColor }) =>  {
          return (
            focused ?
            <Icon name="timer" style={style.Forcused} size={style.iconSize} /> :
            <Icon name="timer" style={style.noForcused} size={style.iconSize} />
          )
        },
      }
    },
    // 勉強時間を集計してグラフなどの統計結果を表示する
    Page2: {
      screen: Analysis,
      navigationOptions: {
        title: 'データ統計',
        tabBarIcon: ({focused, tintColor }) =>  {
          return (
            focused ?
            <Icon name="md-stats" style={style.Forcused} size={style.iconSize} /> :
            <Icon name="md-stats" style={style.noForcused} size={style.iconSize} />
          )
        },
      }
    },
    // 科目一覧の削除、追加、変更の操作を行う
    Page3: {
      screen: () => { return <ManageSubject db={db} /> },
      navigationOptions: {
        title: '科目一覧',
        tabBarIcon: ({focused, tintColor }) =>  {
          return (
            focused ?
            <Icon name="paper" style={style.Forcused} size={style.iconSize} /> :
            <Icon name="paper" style={style.noForcused} size={style.iconSize} />
          )
        },
      }
    },
    // 各種設定画面
    Page4: {
      screen: Settings,
      navigationOptions: {
        title: '設定',
        tabBarIcon: ({focused, tintColor }) =>  {
          return (
            focused ?
            <Icon name="settings" style={style.Forcused} size={style.iconSize} /> :
            <Icon name="settings" style={style.noForcused} size={style.iconSize} />
          )
        },
      }
    }
  },
  // タブのオプションを設定する
  {
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnable: true,
    tabBarOptions: {
      inactiveTintColor: style.noForcused.color,
      activeTintColor: style.Forcused.color,
      style: {
        backgroundColor: 'whitesmoke'
      },
      // ラベルの設定
      showLabel: true,
      labelStyle: {
        fontSize: 13
      },
      // アイコンの設定
      showIcon: true,
      iconStyle: {
       width: 100,
       height: 100,
       padding: 0,
       margin: 0,
      },
    }
  }
);

AppRegistry.registerComponent('StudyRecorder', () => Home);
