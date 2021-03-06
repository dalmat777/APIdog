var Mail = {

	version: 1, // 1 - dialogs, 0 - messages

	explain: function() {
		switch (Site.get("act")) {
			case "item":
				Mail.getMessageById(+Site.get("id"));
				break;

			case "search":
				Mail.search.page();
				break;

			case "chat":
				return Mail.createChat();
				break;

			default:
				Mail.createWrap().then(function(list) {
					var type = parseInt(Site.get("type") || 0);

					return Mail.version && type !== Mail.TYPE_IMPORTANT
						? Mail.requestDialogs(list)
						: Mail.getListMessages(list, type);
				});
		}
	},

	TYPE_IMPORTANT: 3,

	KEY_STORAGE_DIALOGS: "dialogsList",

	/**
	 * Create wrapper for page of dialogs or mail
	 * @return {Promise}
	 */
	createWrap: function() {
		return new Promise(function(resolve) {
			var list;
			Site.append($.e("div", {id: "_mail", append: [
				Mail.getListMessagesTabs(),
				list = $.e("div", {id: "_mail-wrap", append: Site.Loader(true)})
			]}));
			resolve(list);
		});
	},

	/**
	 * Get and parse dialogs list from local storage
	 */
	parseFromStorage: function() {
		var data = $.localStorage(Mail.KEY_STORAGE_DIALOGS);

		return Mail.mStorage = JSON.parse(data);
	},

	/**
	 *
	 * @param {HTMLElement} list
	 */
	requestDialogs: function(list) {
		if (isEnabled(Setting.ENABLED_ONLINE)) {
			Mail.getDialogs(0).then(Mail.showDialogs.bind(Mail, list));
			return;
		}

		var cached = Mail.parseFromStorage();

		if (!cached) {
			Mail.showConfirmStorage(list);
		} else {
			Mail.getMessagesForDialogList(null, 0).then(Mail.showDialogs.bind(Mail, list)).then(Mail.syncDialogs);
		}
	},

	/**
	 * Confirm user about caching
	 * @param {HTMLElement} list
	 */
	showConfirmStorage: function(list) {
		var progress = new ProgressBar(0, 100),
			progressTextNode = $.e("div", {append: [
				$.e("div", {html: Lang.get("mail.confirmStorageProgress")}),
				progress.getNode()
			]}),
			modal = new Modal({
				unclosableByBlock: true,
				title: Lang.get("mail.confirmStorageTitle"),
				content: Lang.get("mail.confirmStorageContent"),
				footer: [
					{
						name: "messages",
						title: Lang.get("mail.confirmStorageButtonMessages"),
						onclick: function() {
							modal.setContent(progressTextNode);
							modal.setButtons([]);
							Mail.performCacheByMessages({modal: modal, progress: progress}).then(Mail.getMessagesForDialogList).then(Mail.showDialogs.bind(Mail, list));
						}
					},
					{
						name: "dialogs",
						title: Lang.get("mail.confirmStorageButtonDialogs"),
						onclick: function() {
							modal.setContent(progressTextNode);
							modal.setButtons([]);
							Mail.performCacheByDialogs({modal: modal, progress: progress}).then(Mail.getMessagesForDialogList).then(Mail.showDialogs.bind(Mail, list));
						}
					}
				]
			});

		modal.show();
	},

	/**
	 * @param {Array} data
	 */
	storeDialogs: function(data) {
		$.localStorage(Mail.KEY_STORAGE_DIALOGS, JSON.stringify(data));
	},

	/**
	 * Parsing result from API to storage
	 * @param {{modal: Modal, progress: ProgressBar}} ui
	 * @param {Array} result
	 * @returns {{modal: Modal, progress: ProgressBar}}
	 */
	parseCacheMessagesFromAPI: function(ui, result) {
		var messageIds = result[0],
			chatIds = result[1],
			userIds = result[2],
			dates = result[3],

			data = messageIds.map(function(messageId, index) {
				return [messageId, dates[index], chatIds[index] ? chatIds[index] + Peer.LIMIT : userIds[index]];
			});

		ui.modal.setContent(Lang.get("mail.confirmStoreLoaded"));
		ui.progress.setValue(100);

		Mail.storeDialogs(data);

		return ui;
	},

	/**
	 * Request for cache dialogs by messages
	 * @param {{modal: Modal, progress: ProgressBar}} ui
	 * @returns {Promise.<Array>}
	 */
	performCacheByMessages: function(ui) {
		return api("execute", {
			code: "var w=0,i=0,t=parseInt(Args.l),v=parseInt(Args.t),s=100,l=i+v*s,m=[],c=[],g;while(w<25){c=c+API.messages.search({q:Args.a,count:s,offset:i}).items;i=i+s;w=w+1;};return[c@.id,c@.peer_id,c@.from_id,c@.date];",
			a: "*",
			l: Peer.LIMIT,
			t: 25,
			v: api.VERSION_FRESH
		}).then(function(result) {
			ui.progress.setValue(75);

			var wasPeerId = [], data = [], messageIds = [], peerIds = [], fromIds = [], dates = [];

			for (var i = 0, l = result[0].length; i < l; ++i) {
				data.push({id: result[0][i], chat: result[1][i], user: result[2][i], date: result[3][i]});
			}

			data.sort(function(a, b) {
				return b.id - a.id;
			}).forEach(function(a) {
				if (~wasPeerId.indexOf(a.chat ? Peer.LIMIT + a.chat : a.user)) {
					return;
				}

				wasPeerId.push(a.chat ? Peer.LIMIT + a.chat : a.user);
				messageIds.push(a.id);
				peerIds.push(a.chat);
				fromIds.push(a.user);
				dates.push(a.date);
			});

			return [messageIds, peerIds, fromIds, dates];
		}).then(Mail.parseCacheMessagesFromAPI.bind(Mail, ui));
	},

	/**
	 * Request for cache dialogs by dialogs (width online)
	 * @param {{modal: Modal, progress: ProgressBar}} ui
	 * @returns {Promise.<Array>}
	 */
	performCacheByDialogs: function(ui) {
		return api("execute", {
			code: [
"var i=0,t=parseInt(Args.l),v=parseInt(Args.t),s=200,l=i+v*s,m=[],c=[],g,q,w;",
"while(i<l){",
	"q=API.messages.getConversations({count:s,offset:i});",
	"w=q.count;",
	"c=c+q.items;",
	"i=i+s;",
"};",
"return[",
	"c@.last_message@.id,",
	"c@.conversation@.peer@.id,",
	"c@.last_message@.from_id,",
	"c@.conversation@.date,",
	"w",
"];"
].join(""),
			l: Peer.LIMIT,
			t: 25,
			v: api.VERSION_FRESH
		}).then(Mail.parseCacheMessagesFromAPI.bind(Mail, ui));
	},

	/** @var {Array[]} mStorage */
	mStorage: null,


	/**
	 * Returns chunk of cached dialogs from storage
	 * @param {int} offset
	 * @param {int} count
	 */
	getChunkCache: function(offset, count) {
		if (!Mail.mStorage) {
			Mail.parseFromStorage();
		}

		return Mail.mStorage.slice(offset, offset + count);
	},

	/**
	 * Add messages to cache storage
	 * @param {object[]} messages
	 */
	addCacheStorage: function(messages) {
		var d = Mail.mStorage, o = {};

		d.forEach(function(i) { o[i[Mail.INDEX_PEER_ID]] = i; });

		messages.sort(function(a, b) {
			return a.id - b.id;
		}).forEach(function(a) {

			o[a.peer_id] = [a.id, a.date, a.peer_id];
		});

		Mail.mStorage = Object.values(o).sort(function(a, b) {
			return b[Mail.INDEX_MESSAGE_ID] - a[Mail.INDEX_MESSAGE_ID];
		});

		Mail.storeDialogs(Mail.mStorage);
	},

	/**
	 * Returns last cached message with max id
	 * @returns {int}
	 */
	getLastMessageId: function() {
		return Mail.getChunkCache(0, 1)[0][Mail.INDEX_MESSAGE_ID];
	},

	DEFAULT_COUNT: 50,

	INDEX_MESSAGE_ID: 0,
	INDEX_DATE: 1,
	INDEX_PEER_ID: 2,

	TYPE_APPROXIMATE: 0x1EA1,

	/**
	 * Request info about messages, profiles and groups
	 * @param {{modal: Modal, progress: ProgressBar}|null} ui
	 * @param {int} offset
	 */
	getMessagesForDialogList: function(ui, offset) {
		var chunk = Mail.getChunkCache(offset || 0, Mail.DEFAULT_COUNT);
		return api("execute", {
			code: "var m=API.messages.getById({message_ids:Args.i,preview_length:120,extended:1,fields:Args.f});m.conversations=API.messages.getConversationsById({peer_ids:m.items@.peer_id}).items;return{c:API.account.getCounters(),d:m};",
			i: chunk.map(function(item) { return item[Mail.INDEX_MESSAGE_ID] }).join(","),
			f: "photo_50,online,sex",
			v: api.VERSION_FRESH
		}).then(function(result) {
			Site.setCounters(result.c);
			Local.add(result.d.profiles);
			Local.add(result.d.groups);

			result.d.conversations.forEach(function(conversation) {
				Mail.__conversations[conversation.peer.id] = conversation;
			});

			result.d.items.forEach(function(message) {
				message.conversation = Mail.__conversations[message.peer_id];
			});

			ui && ui.progress.setValue(100);
			ui && ui.modal.remove();
			result.d.count = Mail.mStorage.length;
			result.d._countType = Mail.TYPE_APPROXIMATE;
			result.d.offset = offset;

			return result.d;
		});
	},

	/**
	 * Request for get dialogs
	 * @param {int} offset
	 */
	getDialogs: function(offset) {
		return api("execute", {
			code: 'return{c:API.account.getCounters(),d:API.messages.getConversations({count:parseInt(Args.c),offset:parseInt(Args.o),extended:1})};',
			f: "photo_50,online,sex",
			o: offset,
			c: Mail.DIALOGS_PER_PAGE,
			v: api.VERSION_FRESH
		}).then(function(data) {
			Site.setCounters(data.c);
			Local.add(data.d.profiles.concat(data.d.groups));
			data.d.offset = offset;
			console.log(data);
			return data.d;
		});
	},

	DIALOGS_PER_PAGE: 50,

	/**
	 * Show dialogs in page
	 * @param {{count: int, items: Message[], offset: int, _countType: int}} data
	 * @param {HTMLElement} list
	 * @returns {Promise}
	 */
	showDialogs: function(list, data) {
		return new Promise(function(resolve) {
			!data.offset && $.elements.clearChild(list);

			data.items.map(function (item) {
				list.appendChild(Mail.item(item, {conversations: !$.localStorage(Mail.KEY_STORAGE_DIALOGS)}));
			});

			Mail.__initLongPollEvents();

			if (data.offset + data.items.length + Mail.DIALOGS_PER_PAGE < data.count + Mail.DIALOGS_PER_PAGE)
				list.appendChild(Site.getNextButton({
					text: Lang.get("im.next"),
					click: function (event) {
						$.event.cancel(event);
						if (this.disabled) {
							return;
						}

						//noinspection JSCheckFunctionSignatures
						Mail.getDialogs(offset + Mail.DIALOGS_PER_PAGE, this);
						this.disabled = true;
					}
				}));

			if (!data.offset) {
				list.parentNode.insertBefore(Site.getPageHeader((data._countType === Mail.TYPE_APPROXIMATE ? "~" : "") + data.count + " " + Lang.get("mail", "dialogs", data.count), Mail.getActions()), list);
			}

			Site.setHeader(Lang.get("mail.dialogs_noun"));
			resolve();
		});
	},

	__initLongPollEvents: function() {
		var needEvents = [
			LongPoll.event.MESSAGE_NEW,
			LongPoll.event.MESSAGE_EDIT,
			LongPoll.event.MESSAGE_READ_IN,
			LongPoll.event.MESSAGE_READ_OUT,
			LongPoll.event.TYPING_USER,
			LongPoll.event.TYPING_CHAT
		];

		var listener = this.__longPollEventListener;

		LongPoll.addListener(needEvents, listener);

		window.onLeavePage = function() {
			LongPoll.removeListener(needEvents, listener);
		};
	},

	/**
	 *
	 * @param {int} eventId
	 * @param {Message|{peerId: int, userId: int}} data
	 * @private
	 */
	__longPollEventListener: function(eventId, data) {
		console.log(eventId, data);
		switch (eventId) {
			case LongPoll.event.MESSAGE_NEW:
				Mail.updateDialogNode(data);
				break;

			case LongPoll.event.TYPING_USER:
			case LongPoll.event.TYPING_CHAT:
				Mail.__setTypingUser(data.peerId, data.userId);
				break;
		}
	},

	/**
	 * Syncing messages for dialog list cache
	 */
	syncDialogs: function() {
		var modal = new Modal({title: Lang.get("mail.syncingTitle"), content: Lang.get("mail.syncingContent"), unclosableByBlock: true, width: 220}).show(),
			lastLocalId = Mail.getLastMessageId();
		//noinspection SpellCheckingInspection
		api("execute", {
			code: "return API.messages.search({q:Args.a}).items[0].id;",
			a: "*",
			v: api.VERSION_FRESH
		}).then(function(lastRealId) {
			var from = [];

			// todo: add progressbar

			for (var i = lastLocalId; i <= lastRealId; ++i) {
				from.push(i);
			}

			return new Promise(function(resolve) {

				if (!from.length) {
					resolve([]);
				}

				var queue = from.inGroupsOf(100),
					current = 0,
					messages = [],
					load = function() {
						Mail.loadChunkOfSyncCache(queue[current].compact()).then(function(result) {
							messages = messages.concat(result.items);
							queue[++current] ? setTimeout(load, 350) : resolve(messages);
						}).catch(function(error) {
							Site.Alert({text: "error while syncing, json: " + JSON.stringify(error)});
							console.error(error);
						});
					};

				load();
			});
		}).then(function(result) {
			Mail.addCacheStorage(result);
			modal.close().remove();
			Mail.syncList(result);
		});
	},

	__conversations: {},

	/**
	 */
	loadChunkOfSyncCache: function(ids) {
		return api("execute", {
			code: "var m=API.messages.getById({message_ids:Args.i,extended:1});m.conversations=API.messages.getConversationsById({peer_ids:m.items@.peer_id}).items;return m;",
			i: Array.isArray(ids) ? ids.join(",") : ids,
			v: api.VERSION_FRESH
		}).then(function(res) {
//console.log(res)
			Local.add(res.profiles);
			Local.add(res.groups);

			res.conversations.forEach(function(conversation) {
				Mail.__conversations[conversation.peer.id] = conversation;
			});

			res.items.forEach(function(message) {
				message.conversation = Mail.__conversations[message.peer_id];
			});

			return res;
		});
	},

	/**
	 *
	 * @param {Message[]} messages
	 */
	syncList: function(messages) {
		if (!$.element("_mail-wrap")) {
			return;
		}

		messages.forEach(Mail.updateDialogNode);
	},

	/**
	 * Updating message row in list
	 * @param {Message} message
	 */
	updateDialogNode: function(message) {
		var peer = Peer.from(message), node, text, parent;

		if (!(node = q("[data-peer-id='" + peer.get() + "']"))) {
			node = Mail.item(message);
			parent = $.element("_mail-wrap");
		} else {
			$.elements[!message.out ? "addClass" : "removeClass"](node, "dialogs-in");
			$.elements[message.out ? "addClass" : "removeClass"](node, "dialogs-out");

			text = message.text.replace(/\n{2,}/g, " ").replace(/\n/ig, " \\ ").safe();
			text = text.length > 120 ? text.substring(0, 120) + ".." : text;
			text = text.emoji();

			if ("conversation" in message && message.conversation.chat_settings) {
				node.querySelector(".dialogs-title strong").textContent = message.conversation.chat_settings.title || "%_MESSAGE_TITLE_%";

				var read = message.conversation.in_read === message.conversation.out_read;

				$.elements[!message.out && !read ? "addClass" : "removeClass"](node, "dialogs-item-new");
				$.elements[message.out && !read ? "removeClass" : "addClass"](node, "dialogs-readed");
			}

			node.querySelector(".dialogs-rawText").innerHTML = !message.action ? text : IM.getStringActionFromSystemVKMessage(message);
			node.querySelector(".dialogs-attachments").textContent = Mail.getStringAttachments(message);
			node.querySelector(".dialogs-date").textContent = getDate(message.date, APIDOG_DATE_FORMAT_SMART);
			node.querySelector(".dialogs-date").dataset.time = String(message.date);
			parent = node.parentNode;
		}

		if (parent.firstChild !== node) {
			parent.insertBefore(node, parent.firstChild);
		}
	},

	photosChats: {},

	/**
	 * Item message
	 * TODO: replace converter by normal function
	 * @param {Message|{message: Message, unread: int}|{conversation: {peer: {id: int, type: string, local_id: int}, in_read: int, out_read: int, unread_count: int, important: boolean, last_message_id: int, chat_settings: {title: string, members_count: int, state: string, photo: {photo_50: string, photo_100: string, photo_200: string}=} }, last_message: object, unread_count: int=}} message
	 * @param {{unread: int=, highlight: string=, toMessage: boolean=, conversations: boolean=}=} options
	 * @returns {HTMLElement}
	 */
	item: function(message, options) {
		var e = $.e, unread, user, text, peer;
		options = options || {};
		unread = message.unread || options.unread || 0;

		if (Mail.version && message.message) {
			message = message.message;
		}

		peer = Peer.from(message);

		if (options.conversations) {
			var info = message.conversation,
				msg = message.last_message;
			message = {
				id: msg.id,
				date: msg.date,
				out: msg.out,
				from_id: info.peer.type === "chat" ? msg.from_id : msg.peer_id,
				chat_id: info.peer.type === "chat" ? info.peer.local_id : null,
				read_state: info.in_read === info.out_read,
				title: info.chat_settings && info.chat_settings.title,
				text: msg.text,
				attachments: msg.attachments,
				fwd_messages: msg.fwd_messages,
				geo: msg.geo
			};

			if (info.peer.type === "chat" && info.chat_settings && info.chat_settings.photo_50) {
				message.photo_50 = info.chat_settings.photo_50;
				message.photo_100 = info.chat_settings.photo_100;
				message.photo_200 = info.chat_settings.photo_200;
			}

			unread = info.unread_count;
		}

		if (message.conversation) {
			unread = message.conversation.unread_count;
		}

		var fromId = peer.isUser() ? peer.getId() : message.from_id;

		user = Local.data[fromId] || {last_name: "", first_name: ""};

		text = message.text.replace(/\n/g, " ").replace(/\n/ig, " \\ ").safe();
		text = text.length > 120 ? text.substring(0, 120) + ".." : text;
		text = text.emoji();

		if (options.highlight) {
			text = text.replace(new RegExp("(" + options.highlight + ")", "igm"), "<span class='search-highlight'>$1<\/span>");
		}


		var date, link = e("a", {"class": "selectfix dialogs-item",
			"data-peer-id": peer.get(),
			"data-message-id": message.id,

			href: !options.toMessage
				? "#im?to=" + peer.get()
				: "#mail?act=item&id=" + message.id,

			id: Mail.version
				? "mail-dialog" + peer.get()
				: "mail-message" + message.id,

			append: [
				e("div", {"class": "dialogs-left", append: e("img", {src: getURL(message.photo_50 || user.photo_50)}) }),

				e("div", {"class": "dialogs-content", append: [
					e("div", {"class": "dialogs-title", append: [
						e("span", {"class": "tip", html: peer.isChat() ? Lang.get("mail.chat_noun") : ""}),
						e("strong", {html: peer.isChat() ? (message.conversation && message.conversation && message.conversation.chat_settings.title || "%_MESSAGE_TITLE_%").safe().emoji() : getName(user)}),
					]}),
					e("div", {"class": "dialogs-text", append: [
						e("img", {"class": "dialogs-miniPhoto", src: getURL(Local.data[API.userId].photo_50)}),
						e("div", {"class": "dialogs-wrapRawText", append: [
							e("div", {"class": "dialogs-rawText", html: [

								user && peer.isChat()
									? user.first_name.safe() + " " + user.last_name.substring(0, 1) + ".: "
									: "",

								!message.action
									? text
									: IM.getStringActionFromSystemVKMessage(message)

							].join("")}),

							e("div", {"class": "dialogs-attachments", html: Mail.getStringAttachments(message)})
						]})
					]}),
				]}),

				date = e("div", {"class": "dialogs-meta", append: [
					e("div", {"class": "dialogs-date", "data-time": message.date, html: getDate(message.date, APIDOG_DATE_FORMAT_SMART)})
				]})
			]});

		bindTooltip(date, {
			content: [
				message.out
					? "Исходящее"
					: "Входящее",

				message.in_read === message.out_read
					? "прочитано"
					: "не прочитано"
			].join(", "),
			position: Tooltip.Y_TOP | Tooltip.X_LEFT,
			width: 200
		});

		date.lastChild.style.marginLeft = "-128px";
		date.lastChild.style.bottom = "36px";

		if (!("toMessage" in options)) {
			date.dataset.count = unread;
		}

		if (!message.out) {
			if (message.in_read !== message.out_read && unread > 0) {
				$.elements.addClass(link, "dialogs-item-new");
			}

			$.elements.addClass(link, "dialogs-in");
		} else {
			$.elements.addClass(link, "dialogs-out");
		}

		if (message.in_read === message.out_read) {
			$.elements.addClass(link, "dialogs-readed");
		}

		return link;
	},

	__setTypingUser: function(peerId, userId) {
		var node = q("[data-peer-id='" + peerId + "']");

		if (!node || !Local.data[userId]) {
			return;
		}

		var time = String(Date.now());

		node = node.querySelector(".dialogs-text");

		$.elements.addClass(node, "dialogs-text-typing");

		var u = Local.data[userId];

		node.dataset.typingText = (userId > 0 ? u.first_name + " " + u.last_name : Lang.get("mail.typingCommunity")) + Lang.get("mail.typing");
		node.dataset.typingTime = time;

		setTimeout(function() {
			if (node.dataset.typingTime === time) {
				$.elements.removeClass(node, "dialogs-text-typing");
			}
		}, 7500);
	},

	dialogsSettings: null,

	/**
	 * Save settings of notifications for dialog
	 * @param {{conversations: {count: int, items: object[]}}} data
	 */
	setNotificationsSettings: function(data) {
		Mail.dialogsSettings = {};
		data.conversations.items.filter(function(item) {
			Mail.dialogsSettings[item.peer_id] = item;
		});
	},

	/**
	 * @param {Message} msg
	 * @returns {string}
	 */
	getStringAttachments: function(msg) {
		if (msg.attachments && msg.attachments.length > 0 || msg.geo || msg.fwd_messages) {
			//noinspection SpellCheckingInspection
			var assoc = {photos: 0, videos: 0, audios: 0, docs: 0, stickers: 0, map: 0, links: 0, walls: 0, fwd_messages: 0, wall_replys: 0, gifts: 0},
				attachments = [];

			msg.attachments && msg.attachments.forEach(function(item) {
				assoc[item.type + "s"]++;
			});

			assoc.map = +!!msg.geo;
			msg.fwd_messages = msg.fwd_messages && msg.fwd_messages.length || 0;

			var attachNames = Lang.get("mail.attachment_names");

			for (var item in attachNames) {
				if (attachNames.hasOwnProperty(item) && assoc[item]) {
					attachments.push((assoc[item] > 1 ? assoc[item] + " " : "") + $.textCase(assoc[item], attachNames[item]));
				}
			}

			if (assoc.stickers) {
				attachments = [attachNames.stickers[0]];
			}

			return attachments.join(", ");
		}

		return "";
	},

	defaultChatImage: "\/\/static.apidog.ru\/multichat-icon50.png",

	getActions: function() {
		var p = {};

		p["readAll"] = {
			label: Lang.get("mail.actionReadAll"),
			onclick: function(item) {
				new Modal({
					width: 395,
					title: Lang.get("mail.readAllConfirmTitle"),
					content: Lang.get("mail.readAllConfirmText"),
					footer: [
						{
							name: "yes",
							title: Lang.get("general.yes"),
							onclick: function () {
								this.close();
								Mail.requestReadAll();
							}
						},
						{
							name: "close",
							title: Lang.get("general.no"),
							onclick: function () {
								this.close();
							}
						}
					]
				}).show(item.node());
			}
		};

		p["createChat"] = {
			label: Lang.get("mail.actionCreateChat"),
			isDisabled: true,
			onclick: function() {
				alert("not implemented yet!");
			}
		};

		p["instruments"] = {
			label: Lang.get("mail.actionInstruments") + " (dev)",
			onclick: function() {
				window.location.href = "#instruments";
			}
		};

		p["mode"] = {
			label: Lang.get(Mail.version ? "mail.actionSwitch2messages" : "mail.actionSwitch2dialogs"),
			onclick: function() {
				Mail.version = +!Mail.version;
				Site.route();
			}
		};

		p["cache"] = {
			label: Lang.get("mail.actionClearCache"),
			onclick: function() {
				Mail.mStorage = null;
				Mail.storeDialogs(null);
				Site.route();
			}
		};

		p["refresh"] = {
			label: Lang.get("mail.actionRefreshCache"),
			onclick: function() {
				Mail.syncDialogs();
			}
		};

		return new DropDownMenu(Lang.get("general.actions"), p).getNode();
	},
/*
	setAutoRead: function (node) {
		API.bitmask += node.checked ? (isEnabled(Setting.AUTO_READ_DIALOG) ? 0 : 2) : (isEnabled(Setting.AUTO_READ_DIALOG) & 2 ? -2 : 0);
	},
*/
	/**
	 * Request read all
	 * @param {int=} readed
	 */
	requestReadAll: function(readed) {
		api("execute", {
			code: 'var m=API.messages.getDialogs({unread:1,count:19}),c=m.count,i=0,m=m.items,q;while(i<m.length){if(m[i].message.chat_id){q={peer_id:2000000000+m[i].message.chat_id};}else{q={peer_id:m[i].message.user_id};};API.messages.markAsRead(q);i=i+1;};return{n:c-19,r:parseInt(Args.r)+i};',
			r: readed || 0,
			v: api.VERSION_FRESH // TODO
		}).then(function(data) {
			if (data.n > 0) {
				return Mail.requestReadAll(data.r);
			}

			data = data.r;

			if (isNaN(data)) {
				return;
			}

			Site.Alert({text: data + " " + $.textCase(data, Lang.get("mail.dialog_was_readed"))});
		});
	},

	deletedMessage: false,

	TYPE: {
		ALL: 0,
		IMPORTANT: 3
	},

	/**
	 * Request list of messages
	 * @param {HTMLElement} list
	 * @param {int} type
	 */
	getListMessages: function(list, type) {
		var params = [
				'', // all messages
				null,
				null,
				',"filters":8' // important
			],
			offset = getOffset();
		api("execute", {
			code: "var m=API.%METHOD%({q:Args.q,preview_length:110,count:parseInt(Args.c),offset:Args.o%FILTER,extended:1});m.conversations=API.messages.getConversationsById({peer_ids:m.items@.peer_id}).items;return{m:m,a:API.account.getCounters()};"
				.replace("%FILTER", params[type])
				.replace("%METHOD%", type === Mail.TYPE.IMPORTANT ? "messages.get" : "messages.search"),
			o: offset,
			q: "*",
			c: Mail.DEFAULT_COUNT,
			f: "photo_50,online,screen_name,sex",
			v: api.VERSION_FRESH
		}).then(function(data) {
			Site.setCounters(data.a);
			Local.add(data.m.profiles);
			Local.add(data.m.groups);

			data.m.conversations.forEach(function(conversation) {
				Mail.__conversations[conversation.peer.id] = conversation;
			});

			data.m.items.forEach(function(message) {
				message.conversation = Mail.__conversations[message.peer_id];
			});

			Mail.showListMessages(data.m, {list: list, type: type, offset: offset});
		});
	},

	/**
	 * Returns tabs
	 * @returns {HTMLElement}
	 */
	getListMessagesTabs: function() {
		return Site.getTabPanel(!Mail.version ? [
			["mail", Lang.get("mail.tabs_all")],
			["mail?type=3", Lang.get("mail.tabs_important")],
			["mail?act=search", Lang.get("mail.tabs_search")]
		] : [
			["mail", Lang.get("mail.tabs_dialogs")],
			["mail?type=3", Lang.get("mail.tabs_important")],
			["mail?act=search", Lang.get("mail.tabs_search")]
		]);
	},

	/**
	 * Show list of messages
	 * @param {{count: int, items: Message[]}} data
	 * @param {{type: int, list: HTMLElement, offset: int}} options
	 */
	showListMessages: function(data, options) {
		var list = options.list,
			count = data.count,
			items = data.items,

			words = Lang.get("mail.types_messages");

		list.id = "mail-list";

		if (Mail.deletedMessage) {
			var removedMessageId = parseInt(Mail.deletedMessage),
				notification;

			list.parentNode.insertBefore(notification = $.e("div", {"class": "photo-deleted", append: [
				document.createTextNode(Lang.get("mail.message_id_deleted").replace(/%i%/ig, removedMessageId)),
				$.e("span", {"class": "a", html: Lang.get("mail.message_restore"), onclick: function() {
					Mail.restoreMessage(removedMessageId).then(function() {
						$.elements.remove(notification);
						Site.Alert({
							text: Lang.get("mail.success_restore"),
							click: function() {
								window.location.hash = "#mail?act=item&id=" + removedMessageId;
							}
						})
					}).catch(function() {
						Site.Alert({text: Lang.get("mail.failed_restore")});
					});
				}})
			]}), list);
			Mail.deletedMessage = false;
		}

		$.elements.clearChild(list);

		if (count) {
			items.forEach(function(item) {
				list.appendChild(Mail.item(item, {toMessage: true}));
			});
		} else {
			list.appendChild(Site.getEmptyField(Lang.get("mail.you_have_not") + Lang.get("mail.you_have_not_by_types")[options.type]));
		}

		list.parentNode.insertBefore(Site.getPageHeader(formatNumber(count) + " " + $.textCase(count, words[options.type]), Mail.getActions()), list);

		list.appendChild(Site.getSmartPagebar(getOffset(), count, Mail.DEFAULT_COUNT));

		Site.setHeader(Lang.get("mail.messages"));
		Mail.__initLongPollEventsForMessages();
	},

	__initLongPollEventsForMessages: function() {
		var needEvents = [
			LongPoll.event.MESSAGE_NEW
		];

		var listener = function(eventId, data) {
			switch (eventId) {
				case LongPoll.event.MESSAGE_NEW:
					var wrap = $.element("mail-list");

					wrap.insertBefore(Mail.item(data, {toMessage: true}), wrap.firstChild);
					break;
			}
		};

		LongPoll.addListener(needEvents, listener);

		window.onLeavePage = function() {
			LongPoll.removeListener(needEvents, listener);
		};
	},

	/**
	 * Request for restore message by ID
	 * @param {int} messageId
	 * @returns {Promise}
	 */
	restoreMessage: function(messageId) {
		return api("messages.restore", {message_id: messageId});
	},

	/**
	 *
	 * @param {int} data
	 */
	getMessageById: function(data) {
		api("execute", {
			code: 'var m=API.messages.getById({message_ids:Args.id,v:'+api.VERSION_LOWER+'}).items[0],i=(m.fwd_messages@.user_id);i.push(m.user_id);if(parseInt(Args.r)==1){API.messages.markAsRead({message_ids:m.id});};var u=API.users.get({user_ids:i,fields:Args.f,v:5.8});return{m:m,u:u};',
			id: data,
			f: "photo_50,screen_name,online,can_write_private_message,first_name_gen,last_name_gen,sex",
			r: isEnabled(Setting.AUTO_READ_DIALOG) ? 1 : 0
		}).then(function(data) {
			Local.add(data["u"]);
			return data.m
		}).then(Mail.showMessage);
	},

	/**
	 * Show message
	 * @param {Message} data
	 */
	showMessage: function(data) {
		var parent = $.e("div");
		var peerId = new Peer(data.chat_id ? Peer.LIMIT + data.chat_id : data.user_id),
			messageId = data.id,

			actions = {

				findMessageInDialog: function() {
					Mail.findOffsetByMessageId(messageId, peerId.get()).then(function(offset) {
						window.location.hash = "#im?to=" + peerId.get() + "&force=1&offset=" + offset + "&messageId=" + messageId;
					});
				},

				openDialog: function() {
					window.location.hash = "#im?to=" + peerId.get();
				},

				forwardMessage: function() {
					IM.forwardMessagesIds = [messageId];
					window.location.hash = "#mail";
				},

				markAsImportant: function() {
					var field = this;
					api("messages.markAsImportant", {
						message_ids: messageId,
						important: +!data.important
					}).then(function() {
						Site.Alert({text: Lang.get("mail.message_success_marked_as") + (!data.important ? Lang.get("mail.message_important") : Lang.get("mail.message_unimportant"))});
						data.important = !data.important;
						field.value = data.important ? Lang.get("mail.mark_as_unimportant") : Lang.get("mail.mark_as_important");
					});
				},

				markAsRead: function() {
					this.disabled = true;
					this.value = "Чтение...";
					var field = this;
					api("messages.markAsRead", {
						message_ids: messageId
					}).then(function() {
						$.elements.remove(field);
					});
				},

				deleteMessage: function() {
					VKConfirm(Lang.get("mail.confirm_delete_message"), function() {
						api("messages.delete", {message_ids: messageId}).then(function(data) {
							Site.Alert({text: Lang.get("mail.success_deleted")});
							Mail.deletedMessage = messageId;
							window.location.hash = "#mail" + (data.out ? "?type=1" : "");
						});
					});
				}
			},
			e = $.elements.create,
			user = Local.data[data.user_id],
			mar = actions.markAsRead;

		parent.appendChild(Site.getPageHeader(Lang.get("mail.message_id") + messageId));

		parent.appendChild(e("div", {"class": "friends-item", append: [
			e("img", {"class": "friends-left", src: getURL(user.photo_50)}),

			e("div", {"class": "mail-head friends-right", append: [
				e("div", {html: (
					data.out && peerId.isUser()
						? Lang.get("mail.message_for") + " <a href='#" + user.screen_name + "'>" + user.first_name_gen.safe() + " " + user.last_name_gen.safe() + Site.isOnline(user) + "<\/a>"
						: (peerId.isUser()
							? Lang.get("mail.message_from") + " <a href='#" + user.screen_name + "'>" + user.first_name_gen.safe() + " " + user.last_name_gen.safe() + Site.isOnline(user) + "<\/a>"
							: Lang.get("mail.message_from_chat") + " &laquo;" + data.title.safe() + "&raquo; " + Lang.get("mail.message_from_chat_from") + " <a href='#" + user.screen_name + "'>" + user.first_name_gen.safe() + " " + user.last_name_gen.safe() + Site.isOnline(user) + "<\/a>"
						)
					)
				}),
				e("div", {"class": "tip", html: getDate(data.date, APIDOG_DATE_FORMAT_SMART)})
			]})
		]}));

		var text = e("div",{"class": "n-f", html: Site.toHTML(data.text.safe()).emoji()});
		text.style.whiteSpace = "";

		parent.appendChild(e("div", {"class": "mail-content-item", append: [
			text,
			Site.createNodeAttachments(data.attachments, "mail" + messageId),
			IM.forwardedMessages(data.fwd_messages)
		]}));

		actions = [
			[actions.openDialog, Lang.get("mail.message_dialog")],
			[actions.findMessageInDialog, Lang.get("mail.message_find")],
			[actions.forwardMessage, Lang.get("mail.message_forward")],
			[actions.markAsImportant, Lang.get("mail.message_mark") + (!data.important ? Lang.get("mail.message_important") : Lang.get("mail.message_unimportant"))],
			[actions.deleteMessage, Lang.get("mail.message_delete")]
		];

		if (!data.read_state && !data.out) {
			actions.splice(actions.length - 2, 0, [mar, "Прочитать"]);
		}

		parent.appendChild(e("div", {"class": "mail-actions", append: actions.map(function(item) {
			return e("input", {type: "button", value: item[1], onclick: item[0]});
		})}));

		parent.appendChild(Site.getPageHeader("Ответить"));
		parent.appendChild(Site.getExtendedWriteForm({
			noHead: true,
			ctrlEnter: true,
			name: "message",
			allowAttachments: APIDOG_ATTACHMENT_PHOTO | APIDOG_ATTACHMENT_VIDEO | APIDOG_ATTACHMENT_AUDIO | APIDOG_ATTACHMENT_DOCUMENT | APIDOG_ATTACHMENT_MAP | APIDOG_ATTACHMENT_LINK,
			mbo: true,
			enableCtrlVFiles: true,
			autoHeightTextarea: true,
			attachmentMethods: {
				photo: "photos.getMessageUploadServer",
				document: "docs.getWallUploadServer"
			},
			smiles: APIDOG_EMOTIONS_MODE_SMILES | APIDOG_EMOTIONS_MODE_STICKERS,
			onSend: function(event) {
				api("messages.send", {
					peer_id: peerId.get(),
					message: event.text,
					attachment: event.attachments.toString(),
					v: 5.56
				}).then(function() {
					window.location.hash = "#mail";
					Site.Alert({text: "Сообщение успешно отправлено!"});
				});
				return false;
			}
		}, 0, 0).getNode());

		Site.setHeader(Lang.get("mail.message"), {link: "mail" + (data.out ? "?type=1" : "")});
		Site.append(parent);
	},

	/**
	 * Search
	 */
	search: {

		/**
		 * Preparing page and form
		 */
		page: function() {
			var parent = $.e("div"),
				list = $.e("div", {id: "__mail-search-list"}),
				e = $.elements.create,
				q;

			if (q = Site.get("q")) {
				Mail.search.onSubmit(decodeURIComponent(q), Site.get("type"));
			}

			parent.appendChild(Mail.getListMessagesTabs());
			parent.appendChild(Site.getPageHeader(Lang.get("mail.search"), e("span", {id: "__mail-search-count", "class": "fr"})));
			parent.appendChild(Mail.search.getForm());
			parent.appendChild(list);

			Site.append(parent);
			Site.setHeader(Lang.get("mail.search"));
		},

		form: null,

		/**
		 * Creating form
		 * @returns {HTMLElement}
		 */
		getForm: function() {
			if (Mail.search.form) {
				return Mail.search.form;
			}

			/** @var {HTMLSelectElement} where */
			var where,
				form = Site.createInlineForm({
					type: "search",
					name: "q",
					value: decodeURIComponent(Site.get("q") || ""),
					placeholder: Lang.get("mail.search_query"),
					title: Lang.get("mail.search"),
					onsubmit: function(event) {
						/** @var {{q: HTMLInputElement}} this */
						event.preventDefault();
						window.location.hash = "#mail?act=search&type=" + where.options[where.selectedIndex].value + "&q=" + encodeURIComponent(this.q.value.trim());
						return false;
					}
				}),
				e = $.elements.create;

			form.appendChild(e("div", {"class": "sf-wrap", append: [
				where = e("select", {name: "where", append: [
					e("option", {value: 1, html: Lang.get("mail.search_by_dialogs")}),
					e("option", {value: 0, html: Lang.get("mail.search_by_messages"), selected: true})
				]})
			]}));

			return Mail.search.form = form;
		},

		/**
		 * Request for search
		 * @param {string} q
		 * @param {int} type
		 * @returns {boolean}
		 */
		onSubmit: function(q, type) {
			api(["messages.search", "messages.searchConversations"][type], [
				{
					v: 5.56,
					count: Mail.DEFAULT_COUNT,
					offset: getOffset(),
					fields: "photo_50,online,screen_name",
					preview_length: 120,
					q: q,
					extended: 1
				}, {
					q: q,
					limit: 32,
					extended: 1,
					fields: "photo_50,online,screen_name,sex",
					v: 5.56
				}
			][type]).then(function(data) {
				Local.add(data.profiles);
				Local.add(data.groups);
				Mail.search.showResult(data, type, {q: q})
			}).catch(function(error) {
				console.error(error);
				Site.Alert({text: "error. please look for console."});
			});
			return false;
		},

		/**
		 *
		 * @param {{count: int, items: Message[]}} data
		 * @param {int} type
		 * @param {{q: string}} options
		 * @returns {*}
		 */
		showResult: function(data, type, options) {
			var item = [
					/**
					 * Parser for search messages
					 * @param {Message} i
					 * @returns {HTMLElement}
					 */
					function(i) {
						return Mail.item(i, {highlight: options.q, toMessage: true});
					},

					/**
					 * Parser for search dialog
					 * @param {User|Chat|{email: string, peer: {id: int}, chat_settings: object}} i
					 * @returns {HTMLElement}
					 */
					function(i) {
						var e = $.elements.create,
							href = "#im?to=" + i.peer.id,
							info = i.peer.id < 2e9 ? Local.data[i.peer.id] : i.chat_settings,
							title = i.peer.id < 2e9 ? getName(info) : info.title.safe();
						return e("div", {"class": "sl-item sl-content-bold", append: [
							e("a", {"class": "sl-photo-wrap", href: href, append:
								e("img", {src: info.photo_50 ? getURL(info.photo_50) : Mail.DEFAULT_CHAT_IMAGE}),
							}),
							e("a", {"class": "sl-content-wrap", href: href, append:
								e("div", {"class": "sl-content", html: title})
							})
						]})
					}][type],
				founded = $.e("div"),
				items = data.items;

			items.forEach(function(i) {
				founded.appendChild(item(i));
			});

			var list = $.element("__mail-search-list");

			if (type === 1) {
				list.classList.add("sl-list");
			}

			$.element("__mail-search-count").innerHTML = data.count ? Lang.get("mail.search_founded") + data.count + " " + $.textCase(data.count, Lang.get("mail.search_messages")) : "";

			$.elements.clearChild(list);
			list.appendChild(founded);

			if (data.count) {
				list.appendChild(Site.getSmartPagebar(getOffset(), data.count, Mail.DEFAULT_COUNT));
			}
		}
	},

	/**
	 * Search place/offset of message in dialog by ID
	 * @param {int} messageId
	 * @param {int} peerId
	 */
	findOffsetByMessageId: function(messageId, peerId) {
		return new Promise(function(resolve) {
			var offset = 0,
				isFound = false,
				active = true,
				stoppedByUser = false,

				modal = new Modal({
					title: "Поиск сообщения..",
					content: "Ищу место в диалоге, это может занять некоторое время..",
					footer: [
						{
							name: "cancel",
							title: "Отмена",
							onclick: function () {
								cancel();
								modal.close();
							}
						}
					],
					unclosableByBlock: true
				}).show(),

				request = function () {

					api("execute", {
						code: "var o=parseInt(Args.o),p=parseInt(Args.p),i=0,l=25,d=[],s=200;while(i<l){d=d+API.messages.getHistory({peer_id:p,offset:o+(s*i),count:s}).items@.id;i=i+1;};return d;",
						o: offset,
						p: peerId,
						v: 5.56
					}).then(function(data) {

						for (var i = 0, l = data.length; i < l; ++i) {
							if (data[i] === messageId) {
								onFound(offset + i);
								break;
							}
						}

						if (data.length !== 0) {
							if (active) {
								offset += data.length;
								setTimeout(request, 350);
							} else if (!stoppedByUser) {
								modal
									.setTitle("Хм..")
									.setContent("Странно.. Сообщение не нашлось в этом диалоге")
									.setButton("cancel", {
										name: "close",
										title: "Закрыть",
										onclick: function () {
											modal.close()
										}
									});
							}
						}
					});
				},

				cancel = function() {
					active = false;
					stoppedByUser = true;
					modal.close();
				},

				onFound = function(offset) {
					if (stoppedByUser) {
						return;
					}

					active = false;
					isFound = true;
					modal.close();
					resolve(parseInt(offset / 50) * 50);
				};
			request();
		});
	},


	DEFAULT_CHAT_IMAGE: "\/\/static.apidog.ru\/multichat-icon50.png",

	/**
	 * Create page and form for creating chat
	 */
	createChat: function() {

		if (!Friends.friends[API.userId]) {
			api("friends.get", {
				fields: Friends.DEFAULT_FIELDS,
				v: 5.56,
				order: "hints"
			}).then(function(data) {
				Friends.friends[API.userId] = data;
				Mail.createChat();
			});
			return;
		}

		var e = $.e,
			parent = e("div"),
			form = e("form", {onsubmit: Mail.onSubmitCreateChat}),
			title = e("div", {"class": "sf-wrap"}),
			status = e("div", {"class": "tip tip-form"}),
			creator = e("input", {
				type: "submit",
				value: Lang.get("mail.create_creator"),
				"class": "mail-create-btn",
				disabled: true
			}),
			selected = 0,

			setStatus = function() {
				creator.disabled = (selected <= 1 || name.value.trim());
				status.innerHTML = Lang.get("mail.create_status", selected).schema({n: selected});
			},

			onClickItem = function (event) {
				var check = form.querySelectorAll("input[type=checkbox]:checked");
				selected = check.length;
				if (selected >= 250)
					$.event.cancel(event);
				if (this.querySelector("input[type=checkbox]").checked)
					$.elements.addClass(this, "mp-checked");
				else
					$.elements.removeClass(this, "mp-checked");
				setStatus();
			},

			name = e("input", {type: "text", required: true, name: "title", onkeyup: setStatus}),
			item = function(item) {
				var i = e("label", {
					"class": "miniProfile-item",
					append: [
						e("img", {"class": "miniProfile-left", src: getURL(item.photo_50)}),
						e("div", {"class": "_checkbox fr"}),
						e("input", {"class": "multiple_friends hidden", type: "checkbox", name: "items[]", value: item.id}),
						e("div", {"class": "miniProfile-right", append: e("strong", {
							append: e("a", {
								href: "#" + (item.screen_name || "id" + item.id),
								onclick: function (event) { $.event.cancel (event) },
								html: getName(item)
							})
						})})
					]
				});

				i.addEventListener("click", onClickItem.bind(i));

				return i;
			},
			list = e("div");

		title.appendChild(e("div", {"class": "tip tip-form", html: Lang.get("mail.create_title")}));
		title.appendChild(name);
		title.appendChild(creator);
		title.appendChild(status);

		for (var i = 0, f = Friends.friends[API.userId].items, friend; friend = f[i]; ++i) {
			list.appendChild(item(friend));
		}

		form.appendChild(title);
		form.appendChild(list);
		parent.appendChild(Site.getPageHeader(Lang.get("mail.create_header")));
		parent.appendChild(form);
		Site.append(parent);
		Site.setHeader(Lang.get("mail.create_header"), {link: "mail"});
		setStatus();
	},

	MAX_COUNT_MEMBERS_IN_CHAT: 200,

	/**
	 * On submit form for create chat
	 * @param {Event} event
	 * @returns {boolean}
	 */
	onSubmitCreateChat: function(event) {
		$.event.cancel(event);

		var title = this.title.value.trim(),
			checked = this.querySelectorAll("input[type=checkbox]:checked"),
			userIds = [];

		for (var i = 0, l = Math.min(checked.length, Mail.MAX_COUNT_MEMBERS_IN_CHAT); i < l; ++i) {
			userIds.push(checked[i].value);
		}

		userIds = userIds.join(",");

		api("messages.createChat", {title: title, user_ids: userIds}).then(function(data) {
			window.location.hash = "#im?to=-" + data;
		}).catch(function(error) {
			/** @var {VkError} error */
			Site.Alert({text: error || error.error_msg})
		});

		return false;
	},

	/**
	 *
	 * @param {int} eventId
	 * @param {Message} data
	 * @private
	 */
	__longPollGlobalListener: function(eventId, data) {
		if (eventId !== LongPoll.event.MESSAGE_NEW) {
			return;
		}

		var peerId = data.peer_id;

		Mail.__playNotify();
	},

	/**
	 * @var {HTMLAudioElement|null}
	 */
	__playerNotify: null,
	__playNotify: function() {
		console.log("__playNotify");
		if (!isEnabled(Setting.SOUND_ON_MESSAGE)) {
			return;
		}

		var audio = this.__playerNotify;

		if (!audio) {
			var format;
			audio = this.__playerNotify = new Audio();
			if (audio.canPlayType("audio/mpeg")) {
				format = "mp3";
			} else if (audio.canPlayType("audio/ogg")) {
				format = "ogg";
			} else {
				return;
			}
			audio.src = "//static.apidog.ru/v6.3/notify." + format;
		}

		if (audio.src) {
			audio.currentTime = 0;
			//noinspection JSIgnoredPromiseFromCall
			audio.play();
		}
	}
};
