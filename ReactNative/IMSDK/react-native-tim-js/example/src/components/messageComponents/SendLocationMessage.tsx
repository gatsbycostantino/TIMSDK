import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Switch } from 'react-native';
import { TencentImSDKPlugin } from 'react-native-tim-js';
import CommonButton from '../commonComponents/CommonButton';
import SDKResponseView from '../sdkResponseView';
import CheckBoxModalComponent from '../commonComponents/CheckboxModalComponent';
import BottomModalComponent from '../commonComponents/BottomModalComponent';
import mystylesheet from '../../stylesheets';
import RNLocation from "react-native-location";


const SendLocationMessageComponent = () => {
    const [res, setRes] = useState<any>({});
    const [userName, setUserName] = useState<string>('未选择')
    const [groupName, setGroupName] = useState<string>('未选择')
    const [priority, setPriority] = useState<string>('')
    const [isonlineUserOnly, setIsonlineUserOnly] = useState(false);
    const [latitude,setLatitude] = useState<number>(0.0)
    const [longitude,setLongitude] = useState<number>(0.0)
    const [isExcludedFromUnreadCount, setIsExcludedFromUnreadCount] = useState(false);
    const receiveOnlineUserstoggle = () => setIsonlineUserOnly(previousState => !previousState);
    const unreadCounttoggle = () => setIsExcludedFromUnreadCount(previousState => !previousState);
    let locationSubscription;
    useEffect(() => {
        RNLocation.configure({
            distanceFilter: 5.0
        });
        RNLocation.requestPermission({
            ios: "whenInUse",
            android: {
                detail: "fine",
                rationale: {
                    title: "Location permission",
                    message: "We use your location to demo the library",
                    buttonPositive: "OK",
                    buttonNegative: "Cancel"
                }
            }
        }).then(grented=>{
            if(grented){

            }
        })

        return stopUpdatingLocation
    }, [])
    const startUpdatingLocation = ()=>{
        locationSubscription = RNLocation.subscribeToLocationUpdates(
            locations=>{
                setLongitude(locations[0].longitude)
                setLatitude(locations[0].latitude)
            }
        )
    }
    const stopUpdatingLocation = ()=>{
        locationSubscription && locationSubscription()
        setLongitude(0.0)
        setLatitude(0.0)
    }

    const sendLocationMessage = async () => {
        const messageRes = await TencentImSDKPlugin.v2TIMManager.getMessageManager().createLocationMessage('',longitude,latitude)

        const id = messageRes.data?.id
        const receiver = userName === '未选择' ? '' : userName
        const groupID = groupName === '未选择' ? '' : groupName
        if (id !== undefined) {
            const res = await TencentImSDKPlugin.v2TIMManager.getMessageManager().sendMessage({
                id:id.toString(),
                receiver: receiver,
                groupID: groupID,
                onlineUserOnly: isonlineUserOnly,
                isExcludedFromUnreadCount: isExcludedFromUnreadCount,
            })
            setRes(res)
        }
    };

    const CodeComponent = () => {
        return res.code !== undefined ? (
            <SDKResponseView codeString={JSON.stringify(res)} />
        ) : null;
    };

    const LocationComponent = () => {
        return (
            <View style={styles.friendgroupview}>
                <View style={styles.selectContainer}>
                    <TouchableOpacity onPress={startUpdatingLocation}>
                        <View style={styles.locationbuttonView}>
                            <Text style={styles.buttonText}>获取当前地理位置信息</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.selectedText}>{`${longitude},${latitude}`}</Text>
                </View>
            </View>
        )

    };

    const FriendComponent = () => {
        const [visible, setVisible] = useState<boolean>(false)

        return (
            <View style={styles.friendgroupview}>
                <View style={styles.selectContainer}>
                    <TouchableOpacity onPress={() => { setVisible(true) }}>
                        <View style={styles.buttonView}>
                            <Text style={styles.buttonText}>选择好友</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.selectedText}>{userName}</Text>
                </View>
                <CheckBoxModalComponent visible={visible} getVisible={setVisible} getUsername={setUserName} type={'friend'} />
            </View>
        )

    };

    const GroupComponent = () => {
        const [visible, setVisible] = useState<boolean>(false)

        return (
            <View style={styles.friendgroupview}>
                <View style={styles.selectContainer}>
                    <TouchableOpacity onPress={() => { setVisible(true) }}>
                        <View style={styles.buttonView}>
                            <Text style={styles.buttonText}>选择群组</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.selectedText}>{groupName}</Text>
                </View>
                <CheckBoxModalComponent visible={visible} getVisible={setVisible} getUsername={setGroupName} type={'group'} />
            </View>

        )
    };

    const PriorityComponent = () => {
        const [visible, setVisible] = useState(false)
        const getSelectedHandler = (selected) => {
            setPriority(selected.name)
        }
        return (
            <>
                <View style={styles.userInputcontainer}>
                    <View style={mystylesheet.itemContainergray}>
                        <View style={styles.selectView}>
                            <TouchableOpacity onPress={() => { setVisible(true) }}>
                                <View style={styles.buttonView}>
                                    <Text style={styles.buttonText}>选择优先级</Text>
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.selectText}>{`已选：${priority}`}</Text>
                        </View>
                    </View>
                </View>
                <BottomModalComponent type='priorityselect' visible={visible} getSelected={getSelectedHandler} getVisible={setVisible} />
            </>
        )
    };

    return (
        <>
            <LocationComponent />
            <FriendComponent />
            <GroupComponent />
            <PriorityComponent />
            <View style={styles.switchcontainer}>
                <Text style={styles.switchtext}>是否仅在线用户接受到消息</Text>
                <Switch
                    trackColor={{ false: "#c0c0c0", true: "#81b0ff" }}
                    thumbColor={isonlineUserOnly ? "#2F80ED" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={receiveOnlineUserstoggle}
                    value={isonlineUserOnly}
                />
            </View>
            <View style={styles.switchcontainer}>
                <Text style={styles.switchtext}>发送消息是否不计入未读数</Text>
                <Switch
                    trackColor={{ false: "#c0c0c0", true: "#81b0ff" }}
                    thumbColor={isExcludedFromUnreadCount ? "#2F80ED" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={unreadCounttoggle}
                    value={isExcludedFromUnreadCount}
                />
            </View>
            <CommonButton
                handler={() => { sendLocationMessage() }}
                content={'发送地理信息'}
            ></CommonButton>
            <CodeComponent></CodeComponent>
        </>
    );
};

export default SendLocationMessageComponent;
const styles = StyleSheet.create({
    userInputcontainer: {
        marginLeft: 10,
        marginRight: 10,
        justifyContent: 'center'
    },
    selectContainer: {
        flexDirection: 'row'
    },
    selectedText: {
        marginLeft: 10,
        fontSize: 14,
        textAlignVertical: 'center',
        lineHeight: 35
    },
    buttonView: {
        backgroundColor: '#2F80ED',
        borderRadius: 3,
        width: 100,
        height: 35,
        marginLeft: 10
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 35
    },
    selectView: {
        flexDirection: 'row',
    },
    selectText: {
        marginLeft: 10,
        lineHeight: 35,
        fontSize: 14,
    },
    friendgroupview: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10
    },
    switchcontainer: {
        flexDirection: 'row',
        margin: 10
    },
    switchtext: {
        lineHeight: 35,
        marginRight: 8
    },
    locationbuttonView: {
        backgroundColor: '#2F80ED',
        borderRadius: 3,
        width: 170,
        height: 35,
        marginLeft: 10
    }
})