'use strict'

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import {
  View,
  TouchableHighlight,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Image,
  ViewPropTypes
} from 'react-native';

import RNPickerSelect from 'react-native-picker-select';
import {SwipeRow} from 'react-native-swipe-list-view';

const ARROW_ICON = require('./img/icon-arrow-settings.png');
const CHECK_ICON = require('./img/icon-check-settings.png');
const INFO_ICON = require('./img/icon-info-settings.png');

class SettingsList extends React.Component {
  static propTypes = {
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    borderHideGroup: PropTypes.bool,
    defaultItemSize: PropTypes.number,
    underlayColor: PropTypes.string,
    defaultTitleStyle: Text.propTypes.style,
    defaultTitleInfoPosition: PropTypes.string,
    scrollViewProps: PropTypes.object,
  };

  static defaultProps ={
    visible: true,
    backgroundColor: 'white',
    borderColor: 'black',
    borderHideGroup: false,
    defaultItemSize: 50,
    underlayColor: 'transparent',
    defaultTitleStyle: {fontSize: 16}
  };

  _getGroups(){
    var groupNumber = -1;
    let headers = [];
    let itemGroup = [];
    let result = [];
    React.Children.forEach(this.props.children, (child) => {
      // Allow for null, optional fields
      if(!child) return;

      if(child.type.displayName === 'Header'){
        if(groupNumber != -1){
          result[groupNumber] = {items: itemGroup, header: headers[groupNumber] };
          itemGroup = [];
        }
        groupNumber++;
        headers[groupNumber] = child.props;
      } else if(child.type.displayName === 'Item'){
        if(groupNumber == -1){
          groupNumber++;
        }
        itemGroup.push(child.props);
      } else {
        if(groupNumber == -1){
          groupNumber++;
        }
        itemGroup.push(child);
      }
    });
    result[groupNumber] = {items: itemGroup, header: headers[groupNumber] };
    return result;
  }

  render(){
    return (
      <ScrollView {...this.props.scrollViewProps} ref="_scrollView">
        {this._getGroups().map((group, index) => {
          return this._groupView(group, index);
        })}
      </ScrollView>
    )
  }

  _groupView(group, index){
    if(group.header){
      if (group.header.visible) {
        let border = {borderTopWidth:1, borderBottomWidth:1};
        if (group.header.borderHide) {
          switch(group.header.borderHide) {
            case 'Top' : border = {borderTopWidth:0, borderBottomWidth:1}; break;
            case 'Bottom' : border = {borderTopWidth:1, borderBottomWidth:0}; break;
            case 'Both' : border = {borderTopWidth:0, borderBottomWidth:0}; break;
          }
        }
  
        return (
        <View key={'group_' + index}>
          <Text style={[{margin:5},group.header.headerStyle]} numberOfLines={group.header.headerNumberOfLines} ellipsizeMode="tail" ref={group.header.headerRef}>{group.header.headerText}</Text>
          <View style={[border, {borderColor: this.props.borderColor }]}>
            {group.items.map((item, index) => {
              return this._itemView(item,index, group.items.length);
            })}
          </View>
        </View>)
      } else {
        return null
      }
    } else {
      let items;
      let borderTopWidth = 1;
      let borderBottomWidth = 1;

      if (this.props.borderHideGroup) {
        borderTopWidth = 0;
        borderBottomWidth = 0;
      }

      if (group.items.length > 0) {
        items = (
          <View style={{borderTopWidth, borderBottomWidth, borderColor: this.props.borderColor}}>
            {group.items.map((item, index) => {
                return this._itemView(item,index, group.items.length);
            })}
          </View>
        );
      }

      return (
        <View key={'group_' + index}>
          {items}
        </View>
      )
    }
  }

  _itemEditableBlock(item, index, position) {
    return ([
      item.title ?
        <Text
            key={'itemTitle_' + index}
            style={[
              item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
              position === 'Bottom' ? null : styles.titleText
            ]}>
            {item.title}
        </Text>
        : null,
        item.isEditable ?
        <TextInput
              key={item.id}
              style={item.editableTextStyle ? item.editableTextStyle : styles.editableText}
              placeholder = {item.placeholder}
              onChangeText={(text) => item.onTextChange(text)}
              value={item.value} />
        : null
    ])
  }

  _itemTitleBlock(item, index, position) {
    return ([
      typeof item.title === 'string' ?
        <Text
            key={'itemTitle_' + index}
            style={[
              item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
              position === 'Bottom' ? null : styles.titleText
            ]}>
            {item.title}
        </Text>
        :
        (typeof item.title === 'object' ?
          <View
            key={'itemTitle_' + index}
            style={[
              item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
              position === 'Bottom' ? null : styles.titleText
            ]}>
            {item.title}
          </View>
        : null),
      typeof item.titleInfo === 'string' ?
        <Text
          key={'itemTitleInfo_' + index}
          style={[
            item.rightSideStyle ? item.rightSideStyle
            :
              position === 'Bottom' ? null : styles.rightSide,
              {color: '#B1B1B1'},
            item.titleInfoStyle
          ]}>
          {item.titleInfo}
        </Text>
      :
        (typeof item.titleInfo === 'object' ?
          <View
            key={'itemTitleInfo_' + index}
            style={[
            item.rightSideStyle ? item.rightSideStyle
            :
              position === 'Bottom' ? null : styles.rightSide,
              {color: '#B1B1B1'},
            item.titleInfoStyle
          ]}>
            {item.titleInfo}
          </View>
        : null)
    ])
  }

  _itemView(item, index, max){
    var border;

    if (!item.visible) {
      return;
    }

    if (item.type && item.type.displayName) {
        return item;
    }

    if(item.borderHide) {
      switch(item.borderHide) {
        case 'Top' : border = {borderBottomWidth:1, borderColor: this.props.borderColor}; break;
        case 'Bottom' : border = {borderTopWidth:1, borderColor: this.props.borderColor}; break;
      }
    } else {
      border = index === max-1 ? {borderWidth:0} : {borderBottomWidth:1, borderColor: this.props.borderColor};
    }

    let titleInfoPosition = item.titleInfoPosition ? item.titleInfoPosition : this.props.defaultTitleInfoPosition;

    return (
      <TouchableHighlight accessible={false} key={'item_' + index} underlayColor={item.underlayColor ? item.underlayColor : this.props.underlayColor} onPress={item.onPress} onLongPress={item.onLongPress} ref={item.itemRef}>
        <View style={item.itemBoxStyle ? item.itemBoxStyle : [styles.itemBox, {backgroundColor: item.backgroundColor ? item.backgroundColor : this.props.backgroundColor}]}>
          {item.icon}
          {item.isAuth ?
            <View style={item.titleBoxStyle ? item.titleBoxStyle : [styles.titleBox, border]}>
              <View style={{paddingLeft:5,flexDirection:'column',flex:1}}>
                <View style={{borderBottomWidth:1,borderColor:this.props.borderColor}}>
                  <TextInput
                    ref="UserNameInputBlock"
                    onSubmitEditing={() => this.refs.PasswordInputBlock.focus()}
                    style={{flex:1,height:30, borderBottomWidth:1}}
                    placeholder = "username"
                    {...item.authPropsUser}
                  />
                </View>
                <View>
                  <TextInput
                    ref="PasswordInputBlock"
                    style={{flex:1,height:30}}
                    placeholder = "password"
                    secureTextEntry={true}
                    returnKeyType={'go'}
                    {...item.authPropsPW}
                    onSubmitEditing={() => item.onPress()}
                  />
                </View>
              </View>
            </View>
          : !item.hasSwipe ?
          <View style={item.titleBoxStyle ? item.titleBoxStyle : [styles.titleBox, border, {minHeight:item.itemWidth ? item.itemWidth : this.props.defaultItemSize}]}>
            {titleInfoPosition === 'Bottom' ?
              <View style={{flexDirection:'column',flex:1,justifyContent:'center'}}>
                {item.isEditable ? this._itemEditableBlock(item, inde, 'Bottom') : this._itemTitleBlock(item, index, 'Bottom')}
              </View>
            : item.isEditable ? this._itemEditableBlock(item, index) : this._itemTitleBlock(item, index)}
            {item.rightSideContent ? item.rightSideContent : null}
            {item.hasSwitch ?
              <Switch
                {...item.switchProps}
                style={styles.rightSide}
                onValueChange={(value) => item.switchOnValueChange(value)}
                value={item.switchState}/>
            : null}
            {item.hasPicker || item.hasDatePicker ?
            <View style={{position: 'absolute', width: '100%', height: '100%'}}>
              <RNPickerSelect
                useDatePicker={item.hasDatePicker}
                placeholder={item.pickerPlaceholder}
                items={item.pickerItems || []}
                itemWidth={item.pickerItemWidth}
                labels={item.pickerLabels || []}
                labelWidth={item.pickerLabelWidth}
                valueToString={item.pickerValueToString}
                onValueChange={item.pickerOnValueChange}
                onUpArrow={item.pickerOnUpArrow}
                onDownArrow={item.pickerOnDownArrow}
                onDonePress={item.pickerOnDonePress}
                onOpen={item.pickerOnOpen}
                onClose={item.pickerOnClose}
                disabled={item.pickerDisabled}
                style={{
                  inputIOS: [...item.titleInfoStyle, {height: '100%', textAlign: 'right', paddingRight: item.hasNavArrow ? 40 : 15}],
                  done: {...item.pickerAccessoryStyle},
                  doneDepressed: {fontSize: 17},
                  chevronActive: {...item.pickerAccessoryStyle},
                  pickerContainer: {...item.pickerContainerStyle}
                }}
                value={item.pickerValue}
                {...item.pickerProps}
              /></View>
              : null}
            {this.itemCheckmarkIcon(item)}
            {this.itemInfoIcon(item)}
            {this.itemArrowIcon(item)}
          </View>
          : 
          <View style={{flex: 1}}>
            <SwipeRow
              style={{}}
              rightOpenValue={-75}
              friction={100}
              disableRightSwipe={true}>
              <View style={[item.swipeHiddenStyle]}>
                <Text/>
                <Text>{'Delete'}</Text>
              </View>
              <View style={item.titleBoxStyle ? item.titleBoxStyle : [styles.titleBox, border, {backgroundColor: '#fff',minHeight:item.itemWidth ? item.itemWidth : this.props.defaultItemSize}]}>
                {titleInfoPosition === 'Bottom' ?
                <View style={{flexDirection:'column',flex:1,justifyContent:'center'}}>
                  {item.isEditable ? this._itemEditableBlock(item, inde, 'Bottom') : this._itemTitleBlock(item, index, 'Bottom')}
                </View>
                : item.isEditable ? this._itemEditableBlock(item, index) : this._itemTitleBlock(item, index)}
                {item.rightSideContent ? item.rightSideContent : null}
                {this.itemCheckmarkIcon(item)}
                {this.itemInfoIcon(item)}
                {this.itemArrowIcon(item)}
              </View>
            </SwipeRow>
          </View>
          }
        </View>
      </TouchableHighlight>
    )
  }

  itemArrowIcon(item) {
    if (item.arrowIcon) {
      return item.arrowIcon;
    }

    if (item.hasNavArrow) {
      return <Image style={[styles.rightSide, styles.arrowStyle, item.arrowStyle]} source={ARROW_ICON} />;
    }

    return null;
  }

  itemCheckmarkIcon(item) {
    if (item.checkmarkIcon) {
      return item.checkmarkIcon;
    }

    if (item.hasCheckmark) {
      return <Image style={[styles.rightSide, item.hasInfo ? styles.checkmarkRight : null, styles.checkmarkStyle, item.checkmarkStyle]} source={CHECK_ICON} />;
    }

    return null;
  }

  itemInfoIcon(item) {
    if (item.infoIcon) {
      return item.infoIcon;
    }

    if (item.hasInfo) {
      return (
        <TouchableHighlight accessible={false} underlayColor={item.underlayColor ? item.underlayColor : this.props.underlayColor} onPress={item.onPressInfo} ref={item.itemRef}>
          <View style={styles.infoTouch}>
            <Image style={[styles.rightSide, styles.infoStyle, item.infoStyle]} source={INFO_ICON} />
          </View>
        </TouchableHighlight>
      )
    }

    return null;
  }

}
module.exports = SettingsList;

const styles = StyleSheet.create({
  itemBox: {
    flex:1,
    justifyContent:'center',
    flexDirection:'row',
},
  titleBox: {
    flex:1,
    paddingLeft:15,
    flexDirection:'row'
  },
  titleText: {
    flex:1,
    alignSelf:'center'
  },
  arrowStyle: {
    height: 13,
    width: 8,
  },
  checkmarkStyle: {
    height: 25,
    width: 25,
  },
  checkmarkRight: {
    marginRight: 0,
  },
  infoStyle: {
    height: 25,
    width: 25,
    alignSelf: 'flex-end',
  },
  infoTouch: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rightSide: {
    marginRight:15,
    alignSelf:'center'
  },
  editableText: {
    flex: 1,
    textAlign: 'right',
    marginRight: 15,
  }
});

/**
 * Optional Header for groups
 */
SettingsList.Header = createReactClass({
  propTypes: {
    visible: PropTypes.bool,
    headerText: PropTypes.string,
    headerStyle: Text.propTypes.style,
    headerRef: PropTypes.func,
    headerNumberOfLines: PropTypes.number,
    headerBorderHide: PropTypes.string,
  },
  getDefaultProps() {
    return {
      visible: true,
      headerNumberOfLines: 1,
    };
  },
  /**
   * not directly rendered
   */
  render(){
    return null;
  }
});

/**
 * Individual Items in the Settings List
 */
SettingsList.Item = createReactClass({
  propTypes: {
    /**
     * Should this item render?
     */
    visible: PropTypes.bool,
    /**
     * Title being displayed
     */
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    titleStyle: Text.propTypes.style,
    /**
     * Icon displayed on the left of the settings item
     */
    icon: PropTypes.node,

    /**
     * Item Box Style
     */
    itemBoxStyle : ViewPropTypes.style,
    /**
     * Title Box Style
     */
    titleBoxStyle: ViewPropTypes.style,
    /**
     * Right Side Style
     */
    rightSideStyle: ViewPropTypes.style,
    /**
     * Editable Right Side Style
     */
    editableTextStyle: Text.propTypes.style,

    /**
     * Individual item width.  Can be globally set in the parent.  Will become deprecated
     */
    itemWidth: PropTypes.number,
    /**
     * Allows for the item to become an auth item
     */
    isAuth: PropTypes.bool,
    authPropsUser: PropTypes.object,
    authPropsPW: PropTypes.object,
    /**
     * Individual background color. Can be globally set in the parent. Will become Deprecated
     */
    backgroundColor: PropTypes.string,

    /**
     * Individual underlay click color.  Can be globally set in the parent.
     */
    underlayColor: PropTypes.string,
    /**
     * Item on press callback.
     */
    onPress: PropTypes.func,
    /**
     * Item on long press callback.
     */
    onLongPress: PropTypes.func,
    /**
     * Enable or disable the > arrow at the end of the setting item.
     */
    hasNavArrow: PropTypes.bool,
    arrowIcon: PropTypes.node,

    arrowStyle: Image.propTypes.style,
    /**
     * Enable or disable a checkmark at the end of the setting item.
     */
    hasCheckmark: PropTypes.bool,
    checkmarkIcon: PropTypes.node,

    checkmarkStyle: Image.propTypes.style,
    /**
     * Enable or disable a info at the end of the setting item.
     * Info icon defines item hotspot.
     */
    hasInfo: PropTypes.bool,
    infoIcon: PropTypes.node,

    infoStyle: Image.propTypes.style,
    /**
     * Called when info icon is pressed.
     */
    onPressInfo: PropTypes.func,

    infoStyle: Image.propTypes.style,
    /**
     * Enable or disable a Switch component
     */
    hasSwitch: PropTypes.bool,
    /**
     * Switch state
     */
    switchState: PropTypes.bool,
    /**
     * Switch props
     */
    switchProps: PropTypes.object,
    /**
     * On value change callback
     */
    switchOnValueChange: PropTypes.func,
    /**
     * Enable or disable a RNPickerSelect component
     */
    hasPicker: PropTypes.bool,
    /**
     * RNPickerSelect value
     */
    pickerValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    /**
     * RNPickerSelect props
     */
    pickerProps: PropTypes.object,
    /**
     * RNPickerSelect accessory bar style
     */
    pickerAccessoryStyle: Text.propTypes.style,
    /**
     * RNPickerSelect accessory bar callbacks
     */
    pickerOnUpArrow: PropTypes.func,
    pickerOnDownArrow: PropTypes.func,
    pickerOnDonePress: PropTypes.func,
    pickerOnClose: PropTypes.func,
    pickerOnOpen: PropTypes.func,
    /**
     * Disable interaction with RNPickerSelect
     */
    pickerDisabled: PropTypes.bool,
    /**
     * Enable or disable swipable component
     */
    hasSwipe: PropTypes.bool,
    /**
     * On value change callback
     */
    pickerOnValueChange: PropTypes.func,
    /**
     * Right side information on the setting item
     */
    titleInfo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    titleInfoStyle: Text.propTypes.style,
    /**
     * If 'Bottom', info is placed beneath the title
     */
    titleInfoPosition: PropTypes.string,
    /**
     * Right side content
     */
    rightSideContent: PropTypes.node,
    /* Gives opens to hide specific borders */
    borderHide: PropTypes.oneOf(['Top', 'Bottom', 'Both']),

    itemRef: PropTypes.func,
  },
  getDefaultProps(){
    return {
      visible: true,
      hasNavArrow: true
    }
  },
  /**
   * not directly rendered
   */
  render(){
    return null;
  },
});
