import 'package:flutter/material.dart';
import 'package:tencent_im_base/tencent_im_base.dart';

import 'package:tim_ui_kit/business_logic/life_cycle/new_contact_life_cycle.dart';
import 'package:tim_ui_kit/data_services/friendShip/friendship_services.dart';
import 'package:tim_ui_kit/data_services/services_locatar.dart';

class TUINewContactViewModel extends ChangeNotifier {
  final FriendshipServices _friendshipServices =
      serviceLocator<FriendshipServices>();
  List<V2TimFriendApplication?>? _friendApplicationList;
  V2TimFriendshipListener? _friendshipListener;
  int _unReadCount = 0;
  NewContactLifeCycle? _lifeCycle;

  set lifeCycle(NewContactLifeCycle? value) {
    _lifeCycle = value;
  }

  int get unreadCount => _unReadCount;

  List<V2TimFriendApplication?>? get friendApplicationList =>
      _friendApplicationList;

  loadData() async {
    final newContactRes = await _friendshipServices.getFriendApplicationList();
    // Only Received Application
    _friendApplicationList = newContactRes?.friendApplicationList
        ?.where((item) =>
            item!.type ==
            FriendApplicationTypeEnum.V2TIM_FRIEND_APPLICATION_COME_IN.index)
        .toList();
    _unReadCount = _friendApplicationList?.length ?? 0;
    notifyListeners();
  }

  Future<V2TimFriendOperationResult?> acceptFriendApplication(
    String userID,
    int type,
  ) async {
    if (_lifeCycle?.shouldAcceptContactApplication != null &&
        await _lifeCycle!.shouldAcceptContactApplication(userID) == false) {
      return null;
    }
    final res = await _friendshipServices.acceptFriendApplication(
      responseType: FriendResponseTypeEnum.V2TIM_FRIEND_ACCEPT_AGREE_AND_ADD,
      type: FriendApplicationTypeEnum.values[type],
      userID: userID,
    );
    if (res != null) {
      return res;
    }
    return null;
  }

  Future<V2TimFriendOperationResult?> refuseFriendApplication(
    String userID,
    int type,
  ) async {
    if (_lifeCycle?.shouldRefuseContactApplication != null &&
        await _lifeCycle!.shouldRefuseContactApplication(userID) == false) {
      return null;
    }
    final res = await _friendshipServices.refuseFriendApplication(
      type: FriendApplicationTypeEnum.values[type],
      userID: userID,
    );
    if (res != null) {
      return res;
    }
    return null;
  }

  setFriendshipListener({V2TimFriendshipListener? listener}) {
    loadData();
    final convListener = V2TimFriendshipListener(
      onFriendApplicationListAdded: (applicationList) {
        listener?.onFriendApplicationListAdded(applicationList);
        loadData();
      },
      onFriendApplicationListDeleted: (userIDList) {
        listener?.onFriendApplicationListDeleted(userIDList);
        loadData();
      },
      onFriendApplicationListRead: () {
        listener?.onFriendApplicationListRead();
        loadData();
      },
    );

    _friendshipListener = convListener;
    if (_friendshipListener != null) {
      _friendshipServices.setFriendshipListener(listener: _friendshipListener!);
    }
  }

  removeFriendShipListener() {
    _friendshipServices.removeFriendListener(listener: _friendshipListener);
  }
}
