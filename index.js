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


// データベース操作オブジェクト
const db = new DB()
// タブ生成
const Home = TabNavigator(
  {
    // 勉強時間を計測する
    Page1: {
      screen: () => { return <Measure /> },
      navigationOptions: {
        title: '時間計測',
        tabBarIcon: ({focused, tintColor }) =>  {
          return (
            focused ?
            <Icon name="timer" style={{color: "white"}} size={20} /> :
            <Icon name="timer" style={{color: tintColor}} size={20} />
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
            <Icon name="ios-stats" style={{color: "white"}} size={20} /> :
            <Icon name="ios-stats" style={{color: tintColor}} size={20} />
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
            <Icon name="paper" style={{color: "white"}} size={20} /> :
            <Icon name="paper" style={{color: tintColor}} size={20} />
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
            <Icon name="settings" style={{color: "white"}} size={20} /> :
            <Icon name="settings" style={{color: tintColor}} size={20} />
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
      activeTintColor: '#ffffff',
      style: {
        backgroundColor: '#555555'
      },
      // ラベルの設定
      showLabel: true,
      labelStyle: {
        fontSize: 15
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
