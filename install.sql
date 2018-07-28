CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` text NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `hits` int(11) DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `admin` tinyint(1) DEFAULT '0',
  `sessionID` text,
  `created` datetime DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `services` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `priority` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_services` (
  `userID` int(11) NOT NULL,
  `serviceID` int(11) NOT NULL,
  `handle` varchar(255) NOT NULL,
  `position` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`userID`,`serviceID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `services` (`id`, `name`, `url`, `image`, `priority`)
VALUES
	(10, 'Facebook', 'https://facebook.com/%s', '/web/icons/facebook.svg', 0),
	(11, 'Twitter', 'https://twitter.com/%s', '/web/icons/twitter.svg', 1),
	(12, 'Instagram', 'https://instagram.com/%s', '/web/icons/instagram.svg', 2),
	(14, 'YouTube', 'https://youtube.com/user/%s', '/web/icons/youtube.svg', 3),
	(15, 'Tumblr', 'https://%s.tumblr.com/', '/web/icons/tumblr.svg', 4),
	(16, 'Google+', 'https://plus.google.com/%s', '/web/icons/googleplus.svg', 5),
	(17, 'Snapchat', 'https://snapchat.com/add/%s', '/web/icons/snapchat.svg', 6),
	(18, 'Twitch', 'https://twitch.tv/%s', '/web/icons/twitch.svg', 7),
	(19, 'Reddit', 'https://reddit.com/user/%s', '/web/icons/reddit.svg', 8),
	(20, 'LinkedIn', 'https://linkedin.com/in/%s', '/web/icons/linkedin.svg', 9),
	(21, 'Xing', 'https://xing.com/profile/%s', '/web/icons/xing.svg', 10),
	(22, 'Pinterest', 'https://pinterest.com/%s', '/web/icons/pinterest.svg', 11),
	(23, 'Medium', 'https://medium.com/@%s', '/web/icons/medium.svg', 12),
	(24, 'Blogger', 'https://%s.blogspot.com', '/web/icons/bloggr.svg', 13),
	(25, 'Mastodon', 'https://mastodon.social/@%s', '/web/icons/mastodon.svg', 14),
	(26, 'Quora', 'https://quora.com/profile/%s', '/web/icons/quora.svg', 15),
	(27, 'Spotify', 'https://open.spotify.com/user/%s', '/web/icons/spotify.svg', 16),
	(28, 'last.fm', 'https://last.fm/user/%s', '/web/icons/lastfm.svg', 17),
	(29, 'SoundCloud', 'https://soundcloud.com/%s', '/web/icons/soundcloud.svg', 18),
	(30, 'myspace', 'https://myspace.com/%s', '/web/icons/myspace.svg', 19),
	(31, 'Flickr', 'https://www.flickr.com/people/%s', '/web/icons/flickr.svg', 20),
	(32, 'DeviantArt', 'https://deviantart.com/%s', '/web/icons/deviantart.svg', 21),
	(33, 'Vimeo', 'https://vimeo.com/%s', '/web/icons/vimeo.svg', 22),
	(34, 'Periscope', 'https://pscp.tv/%s', '/web/icons/periscope.svg', 23),
	(35, 'Steam', 'https://steamcommunity.com/id/%s', '/web/icons/steam.svg', 24),
	(36, 'ESL Gaming', 'https://play.eslgaming.com/player/%s', '/web/icons/esl.svg', 25),
	(37, 'Patreon', 'https://patreon.com/%s', '/web/icons/patreon.svg', 26),
	(38, 'Kickstarter', 'https://kickstarter.com/profile/%s', '/web/icons/kickstarter.svg', 27);
