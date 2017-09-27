function VKAudio(a) {
	this.ownerId = a.owner_id;
	this.audioId = a.id || a.aid;
	this.albumId = a.album_id;
	this.lyricsId = a.lyrics_id;
	this.artist = a.artist;
	this.title = a.title;
	this.duration = a.duration;
	this.genreId = a.genre_id || a.genre;
	this.url = a.url;
	this.date = a.date;
	this.isNoSearch = !!a.no_search;
}

VKAudio.prototype = {

	getAttachId: function () {
		return this.getType() + this.ownerId + "_" + this.getId();
	},

	getType: function () {
		return "audio";
	},

	getId: function () {
		return this.ownerId + "_" + this.audioId;
	},

	mNode: null,

	mNodeControl: null,

	mNodeTimePlayed: null,

	mNodeArtist: null,

	mNodeTitle: null,


	getNodeItem: function(options) {
		options = options || {};

		var e = $.e,
			self = this,

			wrap = e("div", {
				id: "audio" + this.getId(),
				"class": "audio-item",
				append: [
					e("div", {
						"class": "audio-right", append: [
							e("div", {
								"class": "audio-times", append: [
									e("div", {"class": "audio-time-real", html: this.getDuration()}),
									this.mNodeTimePlayed = e("div", {"class": "audio-time-played"})
								]
							}),
							e("div", {"class": "audio-actions", append: this.getActions()})
						]
					}),
					this.mNodeControl = e("div", {"class": "audio-control audio-i audio-i-play"}),
					e("div", {
						"class": "audio-content", append: [
							e("div", {
								"class": "audio-title", append: [
									this.mNodeArtist = e("strong", {html: this.artist.safe()}),
									document.createTextNode(" — "),
									this.mNodeTitle = e("span", {html: this.title.safe()})
								]
							})
						]
					})
				]
			});

		if (options.onClick) {
			$.event.add(wrap, "click", function(event) {
				options.onClick(self.ownerId, self.audioId, self, event);
			});
		}

		return wrap;
	},

	getDuration: function() {
		return $.toTime(this.duration);
	},

	getActions: function() {
		return [];
	},
};

var Audios = {

	/**
	 * Full ID of current audio. Audios.items[<ID>]
	 * @var {string|null}
	 */
	currentAudioFullID: null,

	/**
	 * ID of current playlist in Audios.storage[<ID>]
	 * @var {string|null}
	 */
	currentPlaylistID: null,

	/**
	 * Storage for playlists
	 */
	storage: {},

	/**
	 * Storage for audio by ID
	 */
	items: {},

	/**
	 * Bitmask for audio play settings
	 */
	playSettings: 0,

	/**
	 * Available bits settings
	 */
	BIT_BROADCAST: 16,
	BIT_REPEAT: 32,
	BIT_INVERSE_TIME: 1024,

	/**
	 * Checks if setting is enabled
	 * @param {int} bit
	 * @returns {boolean}
	 */
	isEnabled: function(bit) {
		return !!(Audios.playSettings & bit);
	},

	/**
	 * Classes for nodes
	 */
	CLASS_FLAT_MODE: "audios-flat",
	CLASS_PLAYING: "audios-playing",
	CLASS_RESTRICTED: "audios-restricted",
	CLASS_NOW_BROADCAST: "audios-noBroadcast",
	CLASS_PAUSED: "audios-paused",

	CLASS_HEAD_PLAY: "head-player-button-play",
	CLASS_HEAD_PAUSE: "head-player-button-pause",

	TIME_STR_NON_STARTED: "00:00",

	KEY_AUDIO_VOLUME: "audio-vol",

	/**
	 * Route
	 */
	route: function() {
		var ownerId = parseInt(Site.get("ownerId")) || API.userId;

		switch (Site.get("act")) {
			case "search":
				return Audios.page({ownerId: API.userId}).then(Audios.insertSearchForm);

			case "broadcasts":
				return Audios.page({ownerId: API.userId, playlist: "broadcast"}).then(Audios.requestBroadcasts).then(Audios.showBroadcasts);

			case "popular":
				var genreId = +Site.get("genreId") || 0;
				return Audios.page({ownerId: API.userId, albumId: genreId, playlist: "popular" + genreId}).then(Audios.requestPopular).then(Audios.show);

			case "recommendations":
				return Audios.page({ownerId: ownerId, playlist: "recommendations" + ownerId}).then(Audios.requestRecommendations).then(Audios.show);

			case "radio":
				return Audios.page({ownerId: API.userId}).then(Audios.requestRadio).then(Audios.showRadio);

			case "albums":
				return Audios.getAlbums(ownerId);

			default:
				return Audios.page({ownerId: ownerId, search: true, playlist: ownerId}).then(Audios.requestAudios).then(Audios.show).catch(Audios.fixAudio);
		}
	},


	/**
	 * Create template of audio list
	 * @param {{ownerId: int, search: boolean=, playlist: string=, albumId: int=}} options
	 * @returns {Promise}
	 */
	page: function(options) {
		return new Promise(function(resolve) {
			//noinspection JSCheckFunctionSignatures
			var sl = new SmartList({
					data: {count: -1, items: []},
					countPerPage: 100,
					needSearchPanel: options.search,
					getItemListNode: Audios.getListItem,
					optionsItemListCreator: {
						playlist: options.playlist
					},
					filter: function(q, audio) {
						return ~audio.artist.toLowerCase().indexOf(q) || ~audio.title.toLowerCase().indexOf(q);
					}
				}).setState(SmartList.state.LOADING),
				list = $.e("div", {"class": "audios-list", append: sl.getNode()}),
				tabs = Audios.getTabs(options.ownerId),
				wrap = $.e("div", {"class": "audios-wrap", append: [tabs, list]});

			Site.append(wrap);

			resolve({list: list, sl: sl, ownerId: options.ownerId, albumId: options.albumId});
		});
	},

	/**
	 * Returns tabs
	 * @param {int} ownerId
	 */
	getTabs: function(ownerId) {
		var tabs = [],
			param = API.userId !== ownerId ? "ownerId=" + ownerId : "",
			mine = API.userId === ownerId;

		tabs.push(["audio" + (param ? "?" + param : ""), Lang.get("audio.tabAll")]);
		tabs.push(["audio?act=recommendations" + (param ? "&" + param : ""), Lang.get("audio.tabRecommendations")]);

		mine && tabs.push(["audio?act=search", Lang.get("audio.tabSearch")]);
		mine && tabs.push(["audio?act=popular", Lang.get("audio.tabPopular")]);
		mine && tabs.push(["audio?act=broadcasts", Lang.get("audio.tabFriends")]);

		tabs.push(["audio?act=albums" + (param ? "&" + param : ""), Lang.get("audio.tabAlbums")]);

		mine && tabs.push(["audio?act=radio", Lang.get("audio.tabRadio")]);

		return Site.getTabPanel(tabs);
	},


	/**
	 * Request audio data by owner
	 * @param {{ownerId: int, data}} meta
	 * @returns {Promise|{ownerId: int, data: {count: int, items: VKAudio[]}}}
	 */
	requestAudios: function(meta) {
		var ownerId = meta.ownerId;
		if (Audios.storage[ownerId]) {
			meta.data = {count: Audios.storage[ownerId].length, items: Audios.storage[ownerId]};
			return meta;
		}

		return api("execute", {
			code: "var a=API.audio.get({owner_id:Args.o,count:5000}),s=API.account.getCounters();return{a:a,s:s};",
			o: ownerId,
			v: 5.56
		}).then(function(data) {
			Site.setCounters(data.s);

			if (!data.a || data.a && data.a.items && data.a.items[0] && data.a.items[0].owner_id === 100) {
				throw new TypeError("Audios is not fixed");
			}
			meta.data = data.a;
			Audios.storage[meta.ownerId] = data.a.items;
			return meta;
		}).catch(Audios.fixAudio.bind(Audios, meta));
	},

	/**
	 * Trying fix audio
	 * @param meta
	 * @param {TypeError|null} error
	 */
	fixAudio: function(meta, error) {
		console.log(meta, error);
		if (meta.warning) {
			meta.warning.setText(Lang.get("audio.warningFixImpossible")).setDuration(2000);
			return;
		}

		meta.warning = new Snackbar({
			text: Lang.get("audio.warningNonFixed"),
			duration: 6000
		});
		meta.warning.show();
		return APIdogRequest("app.fixAudio", {token: API.accessToken}).then(function() {
			meta.warning.setText(Lang.get("audio.warningFixDone")).setDuration(3000);
			return Audios.requestAudios(meta);
		});
	},

	/**
	 * Show audio list
	 * @param {{list: HTMLElement, sl: SmartList, data: {count: int, items: VKAudio[]}, ownerId: int}} obj
	 */
	show: function(obj) {
		obj.sl.setData(obj.data);
		window.onScrollCallback = function(event) {
			event.needLoading && obj.sl.showNext();
		};
	},


	/**
	 * Return item node audio
	 * @param {VKAudio|RadioStation} audio
	 * @param {{flatMode: boolean=, playlist: string=, isRadio: boolean=}=} options
	 */
	getListItem: function(audio, options) {

		if (audio.stationId) {
			return Audios.getRadioItem(audio);
		}

		var e = $.e,
			item = e("div"),
			id = audio.owner_id + "_" + audio.id,
			cls = ["audios-item"],
			more,
			actions = !options.isRadio ? Audios.getActionsByAudio(audio) : Audios.getActionsByStation(audio);

		options = options || {};
		options.flatMode && item.classList.add(Audios.CLASS_FLAT_MODE);

		Audios.getCurrent() === id && item.classList.add(Audios.CLASS_PLAYING);
		Audios.items[id] = audio;

		item.id = "audio" + id;
		item.dataset.audioId = id;

		item.addEventListener("click", function(event) {
			if (event.ctrlKey) {
				return Audios.getBitrate(audio);
			}

			Audios.setPlay(audio, options.playlist);
			return $.event.cancel(event);
		});

		item.appendChild(e("div", {"class": "audios-state"}));

		item.appendChild(e("div", {"class": "audios-name", title: audio.artist + " — " + audio.title, append: [
			e("span", {"class": "audios-title", html: audio.title.safe() }),
			e("span", {"class": "audios-artist", html: audio.artist.safe() })
		]}));

		item.appendChild(e("div", {"class": "audios-meta", append: [
			e("div", {"class": "audios-time", html: Audios.TIME_STR_NON_STARTED}),
			more = e("div", {"class": "audios-more", onclick: function(event) {
				event.preventDefault();
				event.stopPropagation();
				event.cancelBubble = true;
			}})
		]}));

		more.appendChild(new DropDownMenu("", actions).getNode());

		item.classList.add.apply(item.classList, cls);

		return item;
	},

	/**
	 * Returns dropdown menu for audio list item
	 * @param {VKAudio} audio
	 * @returns {object[]}
	 */
	getActionsByAudio: function(audio) {
		var items = [], isAvailable = !!audio.url;

		if (audio.owner_id !== API.userId && isAvailable) {
			items.push({
				label: Lang.get("audio.itemActionAdd"),
				onclick: function() {
					Audios.add(audio);
				}
			});
		}

		if (isAvailable) {
			items.push({
				label: Lang.get("audio.itemActionDownload"),
				onclick: function() {
					Audios.download(audio);
				}
			});
		}

		if (audio.lyrics_id) {
			items.push({
				label: Lang.get("audio.itemActionShowLyrics"),
				onclick: function() {
					Audios.openLyricsModal(audio).then(Audios.getLyrics).then(Audios.showLyrics);
				}
			});

		}
		if (isAvailable) {
			items.push({
				label: Lang.get("audio.itemActionShare"),
				onclick: function() {
					//noinspection JSCheckFunctionSignatures
					share("audio", audio.owner_id, audio.id, null, null, {wall: true, user: true, group: true});
				}
			});

			items.push({
				label: Lang.get("audio.itemActionBitrate"),
				onclick: function() {
					Audios.getBitrate(audio);
				}
			})
		}

		if (audio.owner_id === API.userId) {
			items.push({
				label: Lang.get("audio.itemActionRemove"),
				onclick: function() {
					Audios.remove(audio);
				}
			});

		}
		return items;
	},

	/**
	 * Returns items of menu for radio station
	 * @param {RadioStation|VKAudio} audio
	 */
	getActionsByStation: function(audio) {
		var items = [];

		if (audio.canResolveTrack) {
			items.push({
				label: Lang.get("audio.itemActionRadioResolveTrack"),
				onclick: function() {
					Audios.resolveRadioTrack(-audio.id);
				}
			});
		}

		audio.streams.forEach(function(item) {
			items.push({
				label: ["MP3", "AAC", null, "M3U8"][item.format - 1] + " " + item.bitrate + "kbps",
				onclick: function() {
					console.log();
					audio.url = item.url;
					Audios.setPlay(audio, "radio");
				}
			});
		});

		return items;
	},


	/**
	 * Returns full ID of current audio
	 * @returns {string}
	 */
	getCurrent: function() {
		return Audios.currentAudioFullID;
	},

	/**
	 * Returns player
	 * @returns {HTMLElement}
	 */
	getPlayer: function() {
		return $.element("player");
	},

	/**
	 * Returns state of playing
	 * @returns {boolean}
	 */
	isPlaying: function() {
		return !Audios.getPlayer().paused;
	},

	/**
	 * Request for add audio ito user's list
	 * @param {VKAudio} audio
	 * @returns {Promise}
	 */
	add: function(audio) {
		return api("audio.add", {
			owner_id: audio.ownerId,
			audio_id: audio.id
		}).then(function() {
			audio.added = true;
			Site.Alert({text: "Аудиозапись &laquo;" + audio.artist.safe() + " &mdash; " + audio.title.safe() + "&raquo; успешно добавлена в Ваши аудиозаписи"});
			// TODO fire to storage current user
			return true;
		});
	},

	/**
	 * Confirm and request for remove audio
	 * @param {VKAudio} audio
	 */
	remove: function(audio) {
		VKConfirm(Lang.get("audio.confirmAudioRemove"), function () {
			api("audio.delete", {
				owner_id: audio.owner_id,
				audio_id: audio.id
			}).then(function(data) {
				// todo
			});
		});
	},

	/**
	 * Make download audio
	 * @param {VKAudio} audio
	 */
	download: function(audio) {
		var url = audio.url,
			title = audio.artist + " - " + audio.title + ".mp3";

		if ("download" in $.e("a")) {
			$.e("a" , {href: url, target: "_blank", download: title}).click();
		} else {
			window.open("api-v3.php?method=vk.downloadAudio&audio=" + audio.owner_id + "_" + audio.id);
		}

	},

	/**
	 * Open modal window for lyrics
	 * @param {VKAudio} audio
	 * @returns {Promise.<{audio: VKAudio, modal: Modal}>}
	 */
	openLyricsModal: function(audio) {
		return new Promise(function(resolve) {
			var modal = new Modal({
				title: Lang.get("audio.lyricsTitle"),
				content: Site.Loader(true),
				footer: [
					{
						name: "ok",
						title: Lang.get("general.close"),
						onclick: function() {
							this.close();
						}
					}
				]
			});
			resolve({audio: audio, modal: modal.show()});
		});
	},

	/**
	 * Request lyrics by audio object
	 * @param {{audio: VKAudio, modal: Modal, lyrics}} meta
	 * @returns {Promise.<{audio: VKAudio, modal: Modal, lyrics: VKAudioLyrics}>}
	 */
	getLyrics: function(meta) {
		return api("audio.getLyrics", { lyrics_id: meta.audio.lyrics_id, v: 5.56 }).then(function(data) {
			meta.lyrics = data;
			return meta;
		});
	},

	/**
	 * Show lyrics in modal
	 * @param {{audio: VKAudio, modal: Modal, lyrics: VKAudioLyrics}} meta
	 */
	showLyrics: function(meta) {
		meta.modal.setContent(Site.toHTML(meta.lyrics.text));
	},

	timeline: null,
	volumeLine: null,

	setVolumeState: function(volume) {
		Audios.volumeLine.setValue(volume);
		Audios.getPlayer().volume = volume / 100;
		$.localStorage(Audios.KEY_AUDIO_VOLUME, volume);
	},



	player: {

		initEvents: function() {
			var volumeLineNode = $.element("head-player-volume"),
				volumeLineInput = $.element("head-player-volume-input"),

			player = Audios.getPlayer();

			Audios.player.mVolumeGhost = $.element("head-player-volume-ghost");

			//noinspection JSUnresolvedFunction
			Audios.volumeLine = new Slider(volumeLineNode, volumeLineInput);

			Audios.volumeLine.setMinimum(0);
			Audios.volumeLine.setMaximum(100);

			Audios.volumeLine.onchange = Audios.player.onVolumeChangeSlider.bind(Audios.volumeLine);

			//noinspection SpellCheckingInspection
			$.event.add(player, "timeupdate", Audios.player.onTimeUpdatePlayer.bind(player));
			$.event.add(player, "progress", Audios.player.onProgressPlayer.bind(player));
			//noinspection SpellCheckingInspection
			$.event.add(player, "loadedmetadata", Audios.player.onLoadedMetaDataPlayer.bind(player));
			$.event.add(player, "ended", Audios.player.onEndedPlayer.bind(player));

			$.event.add(player, "play", Audios.player.onPlay);
			$.event.add(player, "pause", Audios.player.onPause);

			$.event.add(window, "resize", Audios.volumeLine.recalculate);
			$.event.add($.element("head-player-line-wrap"), "click", Audios.player.onTimelineClick.bind(player));

			//noinspection SpellCheckingInspection
			$.elements.addClass(player, "sys-audio-inited");
		},

		onVolumeChangeSlider: function() {
			var n = this.getValue();
			Audios.setVolumeState(n);
			Audios.player.mVolumeGhost.style.width = Audios.volumeLine.handle.style.left;
		},

		onTimeUpdatePlayer: function() {
			var played = this.currentTime,
				duration = this.duration,
				percent = (100 * played) / duration,
				isReverse = Audios.isEnabled(Audios.BIT_INVERSE_TIME) && duration !== Infinity,
				playedString = $.toTime(!isReverse ? played : duration - played),
				playing;

			if (isReverse) {
				playedString = "-" + playedString;
			}

			$.element("player-playedtime").innerHTML = playedString;
			$.element("head-player-line-played").style.width = percent + "%";

			if ((playing = q(".audios-playing .audios-time")) && this.duration !== Infinity) {
				try {
					playing.textContent = playedString;
				}catch(e){console.error(e)}
			}
		},

		onLoadedMetaDataPlayer: function(event) {

		},

		onProgressPlayer: function() {
			try {
				var buffers = this.buffered,
					progress = $.element("head-player-line-loaded"),
					progresses = progress.children,
					duration = this.duration;

				if (buffers.length < progresses.length) {
					$.elements.clearChild(progress);
				}

				for (var i = 0, l = buffers.length; i < l; ++i) {
					var left = (100 * buffers.start(i)) / duration,
						width = (100 * buffers.end(i)) / duration;

					if (progresses[i]) {
						progresses[i].style.left = left + "%";
						progresses[i].style.width = (width - left) + "%";
					} else {
						var item = $.e("div", {"class": "head-player-line-loaded"});
						item.style.left = left + "%";
						item.style.width = (width - left) + "%";
						progress.appendChild(item);
					}
				}
			} catch (e) {
				console.error(e);
			}
		},

		onEndedPlayer: function() {
			if (Audios.isEnabled(Audios.BIT_REPEAT)) {
				var current = Audios.getCurrent();
				Audios.setPlay(Audios.items[current], Audios.currentPlaylistID);
				if (Audios.isEnabled(Audios.BIT_BROADCAST)) {
					Audios.setBroadcast(Audios.currentAudioFullID);
				}
			} else {
				Audios.next();
			}
		},

		onPlay: function() {
			console.log('play');
			getBody().classList.remove(Audios.CLASS_HEAD_PAUSE);
			getBody().classList.add(Audios.CLASS_HEAD_PLAY);
		},

		onPause: function() {
			getBody().classList.remove(Audios.CLASS_HEAD_PLAY);
			getBody().classList.add(Audios.CLASS_HEAD_PAUSE);
		},

		onTimelineClick: function(event) {
			var pos = $.getPosition($.element("head-player-line")),
				left = event.target === $.element("head-player-line") ? event.layerX : $.getPosition(event.target).left + event.layerX - pos.left;

			this.currentTime = (((left * 100) / pos.width) / 100) * this.duration;
			$.event.cancel(event);
		},

		play: function() {
			Audios.getPlayer().play();
		},

		pause: function() {
			Audios.getPlayer().pause();
		},

		toggle: function () {
			Audios.getPlayer().paused ? Audios.player.play() : Audios.player.pause();
		},

		toggleBroadcast: function (button, state) {
			var bit = Audios.isEnabled(Audios.BIT_BROADCAST);
			if (bit || state) {
				$.elements.removeClass(button, "head-player-live-on");
				Audios.playSettings -= 16;
				Audios.setBroadcast("");
			} else {
				$.elements.addClass(button, "head-player-live-on");
				Audios.playSettings += 16;
				Audios.setBroadcast(Audios.currentAudioFullID);
			}
			$.localStorage("audio-settings", Audios.playSettings);
		},

		toggleRepeat: function (button) {
			var bit = Audios.isEnabled(Audios.BIT_REPEAT);
			if (bit) {
				$.elements.removeClass(button, "head-player-repeat-on");
				Audios.playSettings -= 32;
			} else {
				$.elements.addClass(button, "head-player-repeat-on");
				Audios.playSettings += 32;
			}
			$.localStorage("audio-settings", Audios.playSettings);
		},

		add: function() {
			if (!Audios.currentAudioFullID || Audios.items[Audios.currentAudioFullID].added) {
				return;
			}

			Audios.add(Audios.items[Audios.getCurrent()]).then(function() {
				$.elements.addClass(q(".add-audio"), "head-player-add-on");
				$.elements.addClass(q("#audio" + Audios.currentAudioFullID + " .audio-add"), "audio-added");
			});
		},

		share: function() {
			var ids = Audios.getCurrent().split("_");
			//noinspection JSCheckFunctionSignatures
			share("audio", ids[0], ids[1], null, null, {wall: true, user: true, group: true});
		}

	},




	/**
	 * Start track playing
	 * @param {VKAudio} track
	 * @param {string} playlistId
	 * @returns {*}
	 */
	setPlay: function(track, playlistId) {

		if (!Audios.getPlayer().canPlayType("audio/mpeg")) {
			alert("Ваш браузер не поддерживает воспроизведение MP3 файлов!");
			return;
		}

		var vol = $.localStorage(Audios.KEY_AUDIO_VOLUME);

		if (vol === null || vol === undefined || vol === "null") {
			vol = 100;
		}

		Audios.miniPlayer.show();

		var audioId = track.owner_id + "_" + track.id,
			player = $.element("player");

		if (!track.url) {
			Site.Alert({
				text: (
					API.isExtension
						? "Аудиозапись изъята из публичного доступа."
						: (!isMobile
							? "Не могу получить доступ к аудио. Решение и описание этой проблемы есть в оповещении в меню.\n<strong>УБЕДИТЕЛЬНАЯ ПРОСЬБА: НЕ СОЗДАВАТЬ<\/strong> тикеты в поддержке по этому вопросу. Они будут удаляться без ответа."
							: "На мобильном, к сожалению, прослушивание аудиозаписей недоступно.\nПодробнее о проблеме можно прочитать по ссылке в оповещении, которое находится в меню."
						)
				),
				time: 20000
			});
			return;
		}

		Audios.setVolumeState(vol);

		if (audioId === Audios.getCurrent() && player.src === track.url) {
			Audios.player.toggle();
			return;
		}

		Audios.currentAudioFullID = audioId;
		Audios.currentPlaylistID = playlistId;

		player.src = getURL(track.url, "mp3");
		player.load();
		player.play();

		Audios.setTitle(track);
		Audios.setButtonsState(track);
		Audios.notifyListItem(track);

		Audios.isEnabled(Audios.BIT_BROADCAST) && Audios.setBroadcast(audioId);
	},

	/**
	 * Set title of current track in header of site
	 * @param {VKAudio|RadioStation} track
	 */
	setTitle: function(track) {
		var isRadio = !!track.stationId;
		$.element("head-player-artist").textContent = !isRadio ? track.artist : track.title;
		$.element("head-player-song").textContent = !isRadio ? track.title : track._city;
		$.element("head-player-mini-title").textContent = !isRadio ? track.artist + " - " + track.title : track.title
	},

	/**
	 * Set visibility buttons in header by track
	 * @param {VKAudio} track
	 */
	setButtonsState: function(track) {
		var isRadio = Audios.getRadioCurrent(),
			isOwn = !isRadio && track.owner_id !== API.userId;

		$.elements[isOwn || isRadio ? "removeClass" : "addClass"]($.element("add-audio"), "hidden");
		$.elements[isRadio ? "removeClass" : "addClass"]($.element("find-audio"), "hidden");
		Audios.volumeLine.recalculate();
	},

	/**
	 * Set class on list item for active
	 * @param audio
	 */
	notifyListItem: function(audio) {
		Array.prototype.forEach.call(document.querySelectorAll(".audios-playing .audios-time"), function(item) {
			item.textContent = Audios.TIME_STR_NON_STARTED;
		});
		Array.prototype.forEach.call(document.querySelectorAll("." + Audios.CLASS_PLAYING), function(item) {
			$.elements.removeClass(item, Audios.CLASS_PLAYING);
		});
		Array.prototype.forEach.call(document.querySelectorAll("[data-audio-id='" + audio.owner_id + "_" + audio.id + "']"), function(item) {
			$.elements.addClass(item, Audios.CLASS_PLAYING);
		});
	},

	/**
	 * Send request to broadcast track
	 * @param {string} audioId
	 * @returns {Promise}
	 */
	setBroadcast: function(audioId) {
		return api("audio.setBroadcast", {audio: audioId});
	},

	/**
	 * Find position and ability to navigate in current playlist by current audio
	 * @returns {{position: int, previous: boolean, next: boolean}}
	 */
	getCurrentPositionInList: function() {
		var list = Audios.storage[Audios.currentPlaylistID];

		for (var i = 0, l; l = list[i]; ++i) {
			if (l.owner_id + "_" + l.id === Audios.currentAudioFullID) {
				return { position: i, previous: !!list[i - 1], next: !!list[i + 1] };
			}
		}

		return { position: -1, previous: false, next: false };
	},

	/**
	 * Navigate through current list to back
	 */
	previous: function() {
		var position = Audios.getCurrentPositionInList(), list;

		if (!~position.position) {
			console.warn("Unknown position, unhandled: ", position);
			return;
		}

		if (!position.previous) {
			return;
		}

		list = Audios.storage[Audios.currentPlaylistID];
		Audios.setPlay(list[position.position - 1], Audios.currentPlaylistID);
	},

	/**
	 * Navigate through current list to forward
	 */
	next: function() {
		var position = Audios.getCurrentPositionInList(), list;

		if (!~position.position) {
			console.warn("Unknown position, unhandled: ", position);
			return;
		}

		if (!position.next) {
			return;
		}

		list = Audios.storage[Audios.currentPlaylistID];
		Audios.setPlay(list[position.position + 1], Audios.currentPlaylistID);
	},

	miniPlayer: {
		mHead: null,

		getHead: function() {
			return this.mHead || (this.mHead = q(".head-content"));
		},

		hide: function(event) {
			this.getHead().dataset.open = "title";
			return $.event.cancel(event);
		},

		show: function(event) {
			this.getHead().dataset.open = "player";
			return $.event.cancel(event);
		},

		changeFormatTime: function(event) {
			Audios.playSettings = (Audios.isEnabled(Audios.BIT_INVERSE_TIME) ? Audios.playSettings - Audios.BIT_INVERSE_TIME : Audios.playSettings + Audios.BIT_INVERSE_TIME);
			Audios.player.onTimeUpdatePlayer();
			return $.event.cancel(event);
		}
	},

	/**
	 * Request for list of recommendations
	 * @param meta
	 * @returns {Promise.<{count: int, items: VKAudio[]}>}
	 */
	requestRecommendations: function(meta) {
		return api("audio.getRecommendations", {
			count: 500,
			user_id: meta.ownerId,
			v: 5.56
		}).then(function(data) {
			meta.data = data;
			Audios.storage["recommendations" + meta.ownerId] = data.items;
			return meta;
		});
	},

	/**
	 * Request for list of popular
	 * @param {{ownerId: int, list: HTMLElement, data: {count: int, items: VKAudio[]}, albumId: int}} meta
	 * @returns {Promise.<{count: int, items: VKAudio[]}>}
	 */
	requestPopular: function(meta) {
		var genreSelector = $.e("select", {
			"class": "fr",
			append: Audios.getGenreOptions(),
			onchange: function() {
				window.location.hash = "#audio?act=popular&genreId=" + getValue(this);
			}
		});

		genreSelector.selectedIndex = (function(a,b,c,d){for(d=a.length;++c<d;)if(a[c][0]===b)return c})(Audios.genres,meta.albumId,-1);

		meta.list.parentNode.insertBefore(Site.getPageHeader(Lang.get("audio.popularTitle"), genreSelector), meta.list);
		return api("audio.getPopular", {
			count: 500,
			genre_id: meta.albumId,
			v: 5.56
		}).then(function(data) {
			var count = data.length;
			meta.data = {count: count, items: data};
			Audios.storage["popular" + meta.albumId] = data;
			return meta;
		});
	},

	/**
	 * Request for current broadcasts friends and groups
	 * @param {{ownerId: int, data: object?, list: HTMLElement}} meta
	 * @returns {Promise.<{ownerId: int, data: {count: int, items: VKAudio[]}}>}
	 */
	requestBroadcasts: function(meta) {
		Site.setHeader(Lang.get("audio.broadcastTitle"));
		meta.list.parentNode.insertBefore(Site.getPageHeader(Lang.get("audio.broadcastTitle")), meta.list);
		return api("audio.getBroadcastList", {
			filter: "all",
			active: 1,
			fields: "online,photo_50,screen_name"
		}).then(function(data) {
			meta.data = {count: data.length, items: data};
			Audios.storage["broadcast"] = data;
			return meta;
		});
	},

	/**
	 * Show broadcasts
	 * @param {{ownerId: int, sl: SmartList, data: {count: int, items: VKAudio[]}}} meta
	 */
	showBroadcasts: function(meta) {
		Local.add(meta.data);
		var e = $.e,
			item = function(c) {
			return e("div", {"class": "audios-broadcast", append: [
					e("div", {"class": "audios-broadcast-left", append: e("img", {src: getURL(c.photo_50)}) }),
					e("div", {"class": "audios-broadcast-right", append:
						e("a", {href: "#" + c.screen_name, append: [
							e("strong", {html: getName(c)}),
							Audios.getListItem(c.status_audio)
						]})
					})
				]})
			};
		meta.sl.setGetItemListNode(item).setData(meta.data);
	},

	/**
	 * Returns query params
	 * @returns {{query: string, performerOnly: int, lyricsOnly: int, sort: int}}
	 */
	getSearchQuery: function() {
		var q = Site.get();
		return {
			query: q.query || "",
			performerOnly: q.performerOnly || 0,
			lyricsOnly: q.lyricsOnly || 0,
			sort: q.sort || 2
		};
	},

	/**
	 * Insert to prepared page search form
	 * @param {{ownerId: int, list: HTMLElement, sl: SmartList}} meta
	 * @returns {Promise.<{ownerId: int, list: HTMLElement, sl: SmartList}>}
	 */
	insertSearchForm: function(meta) {
		var e = $.e,
			q = Audios.getSearchQuery(),
			fldPerformer,
			fldLyrics,
			strResults = $.e("div", {html: Lang.get("audio.searchTitle")}),
			form = Site.createInlineForm({
				type: "search",
				name: "q",
				value: q.query,
				placeholder: Lang.get("audio.searchFieldPlaceholder"),
				title: "Поиск",
				onsubmit: function(event) {
					event.preventDefault();

					q.query = this.q.value.trim();
					q.lyricsOnly = +fldLyrics.checked;
					q.performerOnly = +fldPerformer.checked;

					window.history.replaceState(null, document.title, "#audio?act=search&" + Object.toQueryString(q));
					Audios.requestSearch({query: q, sl: meta.sl, header: strResults}).then(Audios.showSearchResults);
					return false;
				}
			});

		form.appendChild(e("div", {"class": "sf-wrap", append: [
			e("label", {
				append: [
					fldPerformer = e("input", {type: "checkbox", name: "performer"}),
					e("span", {html: " только по исполнителям"})
				]
			}),
			e("label", {
				append: [
					fldLyrics = e("input", {type: "checkbox", name: "lyrics"}),
					e("span", {html: " только с текстом"})
				]
			})

			/**
			 * А поиск пусть останется незадокументированной фичей ;)
			 * Хотя додуматься о нем не составит труда: в адресе он всегда будет выводиться
			 */

		]}));

		meta.list.parentNode.insertBefore(Site.getPageHeader(strResults), meta.list);
		meta.list.parentNode.insertBefore(form, meta.list);

		window.onScrollCallback = function(event) {
			event.needLoading && sl.showNext();
		};

		Audios.requestSearch({query: q, sl: meta.sl, header: strResults}).then(Audios.showSearchResults);
	},

	/**
	 * Request for search audios
	 * @param {{sl: SmartList, query: Audios.getSearchQuery, header: HTMLElement}} meta
	 * @returns {Promise.<{sl: SmartList, query: Audios.getSearchQuery, header: HTMLElement}>}
	 */
	requestSearch: function(meta) {
		meta.sl.setState(SmartList.state.LOADING);
		return api("audio.search", {
			q: meta.query.query,
			performer_only: meta.query.performerOnly,
			lyrics: meta.query.lyricsOnly,
			sort: meta.query.sort,
			count: 200,
			v: 5.63
		}).then(function(data) {
			meta.data = data;
			return meta;
		});
	},

	/**
	 * Show search results
	 * @param {{sl: SmartList, query: Audios.getSearchQuery, header: HTMLElement, data: {count: int, items: VKAudio[]}}} meta
	 */
	showSearchResults: function(meta) {
		meta.header.textContent = Lang.get("audio.searchHeadResult").schema({
			n: formatNumber(meta.data.count),
			w: Lang.get("audio.searchAudios", meta.data.count)
		});

		meta.sl.setData(meta.data);
	},











	getAlbums: function (owner_id) {
		owner_id = owner_id || API.userId;
		if (!Audios.Albums[owner_id] && !Audios.l2a[owner_id])
			return Site.API("audio.getAlbums", {
				count: 75,
				owner_id: owner_id
			}, function (data) {
				data = Site.isResponse(data);

				Audios.getAlbums(owner_id);
				Audios.l2a[owner_id] = true;
			});
		var parent = document.createElement("div"),
			list = document.createElement("div"),
			albums = Audios.Albums[owner_id];
		if (owner_id == API.userId || Local.data[owner_id] && Local.data[owner_id].is_admin)
			list.appendChild($.elements.create("a", {
				"class": "list-item",
				href: "#audio?act=albums&action=create",
				html: "<i class='list-icon list-icon-add'></i> Создать альбом"
			}));
		var to = Photos.getToParam(1);
		if (albums)
			for (var i = 0; i < albums.length; ++i) {
				var album = Audios.Albums[owner_id + "_" + albums[i]];
				list.appendChild($.elements.create("a", {
					"class": "list-item",
					href: "#audio?oid=" + album.owner_id + "&album=" + album.album_id + to,
					html: Site.Escape(album.title)
				}));
			}
		else
			list.appendChild(Site.getEmptyField("Альбомов нет"));
		list.id = "audiolist";
		parent.appendChild(Site.getPageHeader("Альбомы"));
		parent.appendChild(Audios.getRightPanel());
		parent.appendChild(list);
		Site.append(parent);
		Site.setHeader("Альбомы");
	},



	editAudio: function (ownerId, audioId)
	{
		var id = ownerId + "_" + audioId,
			audio = Audios.Storage[id];
		if (!audio || audio.lyrics_id && !audio.text) {
			Site.API("execute", {
				code: "var a=API.audio.getById({audios:\"%i\"})[0];return{a:a,l:API.audio.getLyrics({lyrics_id:a.lyrics_id}).text};"
					.replace(/%i/img, id)
			}, function (data) {
				data = Site.isResponse(data);
				data.a.text = data.l;
				Audios.Storage[data.a.owner_id + "_" + (data.a.aid || data.a.id)] = data.a;
				Audios.editAudio(ownerId, audioId);
			});
			return;
		}
		var e = $.e,
			tip = function (l) { return e("div", {"class": "tip tip-form", html: l}); },
			artist,
			title,
			text,
			genre,
			noSearch,
			wrap = e("div", {append: [
				Site.getPageHeader("Редактирование аудиозаписи"),
				form = e("form", {"class": "sf-wrap", append: [
					tip("Исполнитель:"),
					artist = e("input", {type: "text", value: audio.artist}),
					tip("Название:"),
					title = e("input", {type: "text", value: audio.title}),
					tip("Жанр:"),
					genre = e("select", {append: Audios.getGenreOptions()}),
					e("label", {append: [
						noSearch = e("input", {type: "checkbox", name: "noSearch"}),
						e("span", {html: " не выводить в поиске"})
					]}),
					tip("Текст:"),
					text = e("textarea", {html: audio.text}),
					e("input", {type: "submit", value: "Сохранить"})
				]})
			]});
		if (audio.no_search)
			noSearch.checked = true;
		if (audio.genre)
			genre.selectedIndex = (function (a,b,c,d){for(d=a.length;c++<d;)if(a[c]&&a[c][0]===b)return c})(Audios.genres, audio.genre, 0);
		$.event.add(form, "submit", function (event)
		{
			event.preventDefault();

			Site.API("audio.edit",
				{
					owner_id: ownerId,
					audio_id: audioId,
					artist: artist.value.trim(),
					title: title.value.trim(),
					text: text.value.trim(),
					genre_id: genre.options[genre.selectedIndex].value,
					no_search: noSearch.checked ? 1 : 0
				},
				function (data)
				{
					if (data.response !== null)
					{
						Site.Alert({text: "Сохранено успешно"});
						audio.artist = artist.value.trim();
						audio.title = title.value.trim();
						audio.text = text.value.trim();
						audio.genre_id = genre.options[genre.selectedIndex].value;
						audio.no_search = noSearch.checked;
					}
					else
						Site.isResponse(data);
				});
			return false;
		});
		Site.append(wrap);
		Site.setHeader("Редактирование аудиозаписи", {link: "audio?act=item&ownerId=" + ownerId + "&audioId=" + audioId});
	},

	genres: [[0,"---"],[1,"Rock"],[2,"Pop"],[3,"Rap & Hip-Hop"],[4,"Easy Listening"],[5,"Dance & House"],[6,"Instrumental"],[7,"Metal"],[21,"Alternative"],[8,"Dubstep"],[9,"Jazz & Blues"],[10,"Drum & Bass"],[11,"Trance"],[12,"Chanson"],[13,"Ethnic"],[14,"Acoustic & Vocal"],[15,"Reggae"],[16,"Classical"],[17,"Indie Pop"],[19,"Speech"],[22,"Electropop & Disco"],[18,"Other"]],

	/**
	 * Returns array of node options for selector genres
	 * @returns {HTMLElement[]}
	 */
	getGenreOptions: function() {
		return Audios.genres.map(function(d){return $.e("option",{value:d[0],html:d[1]})});
	},

	// Будто кто-то будет заливать аудио...
	showUploadForm: function() {
		var node = $.e("input", {
			type: "file",
			accept: "audio/mp3",
			multiple: true,
			onchange: function() {
				uploadFiles(node, {
					maxFiles: 5,
					method: "audio.getUploadServer"
				}, {
					onTaskFinished: function (result) {
						result.forEach(function (a) {
							// TODO
						});
						Site.route("#audio");
					}
				});
			}
		});
		node.click();
	},


	radio: {},

	/**
	 * Request radio stations
	 * @param meta
	 * @returns {Promise.<RadioStation[]>}
	 */
	requestRadio: function(meta) {
		return new Promise(function(resolve) {
			meta.list.parentNode.insertBefore(Site.getPageHeader("Онлайн-радио", $.e("a", {
				"class": "fr",
				href: "http:\/\/radio.vlad805.ru\/",
				target: "_blank",
				html: "radio.vlad805.ru"
			})), meta.list);
			Site.setHeader("Online radio", {});
			return vlad805.api.radio.get(60).then(function(result) {
				meta.data = result;
				resolve(meta);
			}).catch(console.error.bind(console));
		});
	},

	/**
	 * Show list of radio stations
	 * @param {{list: HTMLElement, sl: SmartList, data: {count: int, items: RadioStation[], cities: RadioCity[]}}} meta
	 */
	showRadio: function(meta) {
		var cities = (function(a, b) {
			a.forEach(function(c) {
				b[c.cityId] = c;
			});
			return b;
		})(meta.data.cities, {}, null);

		meta.data.items.forEach(function(item) {
			if (item.cityId && cities[item.cityId]) {
				item["cityName"] = cities[item.cityId].city;
			}
			//meta.list.appendChild(Audios.getRadioItem(item, cities));
			Audios.radio[item.stationId] = item;
		});

		meta.data.items = meta.data.items.map(function(st) {
			return {
				owner_id: 0,
				id: -st.stationId,
				title: st.title,
				artist: st.cityName ? st.cityName + (st.frequency ? ", " + st.frequency + "MHz" : "") : "-",
				duration: Infinity,
				url: st.streams[0].url,
				streams: st.streams,
				canResolveTrack: st.canResolveTrack
			};
		});

		meta.sl.setOptionsItemListCreator("isRadio", true).setData(meta.data);
	},

	/**
	 * Returns station id if playing radio
	 * @returns {int|boolean}
	 */
	getRadioCurrent: function() {
		return Audios.currentAudioFullID && Audios.currentAudioFullID.indexOf("0_") === 0 && -Audios.currentAudioFullID.substring(2);
	},

	/**
	 * Return item for radio station list
	 * @param st
	 * @returns {Element}
	 */
	getRadioItem: function(st) {
		return Audios.getListItem(st, {
			isRadio: true
		});
	},

	/**
	 * Request for resolve track
	 * @param {int} stationId
	 */
	resolveRadioTrack: function(stationId) {
		if (!stationId) {
			return;
		}

		var station;
		if (!isNaN(stationId)) {
			station = Audios.radio[stationId];
		}

		vlad805.api.radio.getCurrentBroadcastingTrack(station.stationId).then(function(data) {
			if (data.title) {
				alert(Lang.get("audio.radioResolveTrackSuccess").schema({n: station.title, t: data.artist + " -- " + data.title}));
			} else {
				alert(Lang.get("audio.radioResolveTrackFail"));
			}
		});
	},

	/**
	 * Request and show bitrate of audio
	 * @param {VKAudio} audio
	 */
	getBitrate: function(audio) {
		APIdogRequest("vk.getAudioBitrate", { audio: audio.owner_id + "_" + audio.id, accessToken: API.accessToken }).then(function(data) {
			alert("Примерный битрейт: " + data.bitrate + "kbps");
		}).catch(function() {
			alert("К сожалению, не получилось получить битрейт");
		});
	},

	/**
	 * Request all playlist from VK and returns file m3u8
	 */
	downloadM3U8: function() {
		api("audio.get", {v: 5.56}).then(function(result) {
			var lines = result.items.map(function(i) {
				return "#EXTINF:" + i.duration + "," + i.artist + " - " + i.title + "\n" + i.url;
			});
			//noinspection ES6ModulesDependencies,JSUnresolvedFunction
			saveAs(new Blob(["#EXTM3U\n#PLAYLIST:Playlist Name\n" + lines.join("\n")], {type: "audio/x-mpegurl", charset:"utf-8"}), "playlist.m3u8");
		});
	}
};