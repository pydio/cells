# Changes between v2.3.2 and v2.3.3

[See Full Changelog](https://github.com/pydio/cells/compare/v2.3.2...v2.3.3)

- [#38d894f](https://github.com/pydio/cells/commit/38d894f6e90ec742d9aaa8def52bf1fa55e06cee): Optimize GetNodeFirstAvailableChildIndex : dedicated sql query, do not look for missing numbers if sql is "full", use binary search to find first available slot.
- [#f9e1061](https://github.com/pydio/cells/commit/f9e10613cc81ab70b697944a42dacdfb871ba865): Merge remote-tracking branch 'origin/master'
- [#9a86ab1](https://github.com/pydio/cells/commit/9a86ab1ca703ddae8e29928d966a62e94c150f75): Freeing the read lock quicker
- [#23c816c](https://github.com/pydio/cells/commit/23c816ce31b7a4f88fb6e06f5ebc31a5565129e4): Lower logs level
- [#3728fec](https://github.com/pydio/cells/commit/3728feceba0486cd45ea74535e8fc52da3cef509): Set disable button on click for compression action
- [#68e03d7](https://github.com/pydio/cells/commit/68e03d71099ec0c2f5a870bea644f720a20fc958): Merge remote-tracking branch 'origin/master'
- [#608de7e](https://github.com/pydio/cells/commit/608de7edc713f12051bb5e7da1cc94986cc9c766): Remove unnecessary debug log
- [#271320e](https://github.com/pydio/cells/commit/271320ee19498dfac5dfb889a9195956e3753992): Additional checks for specific policies when launching compression action
- [#7708c56](https://github.com/pydio/cells/commit/7708c562da93c68d5590bfcff7811d3cfc139758): RMutex to registry peers
- [#57cd36c](https://github.com/pydio/cells/commit/57cd36c557a540bfb7c763d4938eba88d48e8b86): RMutex to service children runner
- [#706b741](https://github.com/pydio/cells/commit/706b741f548f9766eeda6ebeabc12bcfd9119525): Correct check on stream error - Skip warning on user if 404
- [#8183955](https://github.com/pydio/cells/commit/818395551575fe51eb31ca1f2c938d1080f5e17f): Re-adapt dl iframe to react createRef
- [#063cf3d](https://github.com/pydio/cells/commit/063cf3d5ec09385bbe6bb1b95a29f018248bdd51): Split download into multiple actions for selective disable
- [#3674de6](https://github.com/pydio/cells/commit/3674de6c8ca94646d179bc1011e50d2733a4dbcc): Split specific buckets rewrite in two instructions (if_op not working as expected)
- [#211e082](https://github.com/pydio/cells/commit/211e082bf7a74c12ef6e660f2e568bd228110fe6): Bolt versions tag logger with service name
- [#68b6f5a](https://github.com/pydio/cells/commit/68b6f5a6d760bb34833c08c755ef0ec30eb066c6): Fix GetNodeTree sorting in cacheDAO - Delay childrenEvents a bit on deletion.
- [#c45a786](https://github.com/pydio/cells/commit/c45a786fa78a67ad410e4cf208265cfdccf402b5): Clone msg in memory broker
- [#ba556d4](https://github.com/pydio/cells/commit/ba556d4ee7a8af549e836d38bb34a204fcaea0df): Switch memory broker to a pub/sub implementation
- [#2b187cf](https://github.com/pydio/cells/commit/2b187cffec6f419210fc109bf9fe2ef95506bdfe): Hidden command for benching broker
- [#2854603](https://github.com/pydio/cells/commit/2854603f9b009c6d4406f3187ec62c233884c084): Meta/grpc: key-based mutex can lock, disable
- [#b72e8cf](https://github.com/pydio/cells/commit/b72e8cf4925868c502b9cd7f96fa8471085dc0d9): Scheduler subscriber : filter out internal DS events
- [#75b9baa](https://github.com/pydio/cells/commit/75b9baab612e0c5be4ec75755c4b0d6e3304509c): Setting timeout and max number of routines to memory broker
- [#51514fe](https://github.com/pydio/cells/commit/51514fe33baddce87131ee3ae655336de039d22e): once.Do devDirective registration, as it was preventing restart after install.
- [#b2a8c5e](https://github.com/pydio/cells/commit/b2a8c5e02be039f232c860b3978d5389e490bc08): Harmonize masonry with thumbs view
- [#ace499e](https://github.com/pydio/cells/commit/ace499e9ec6b83e84b198bebdd8ecd4a937347d9): Show loader on ENTER button when submitting login
- [#0058d0a](https://github.com/pydio/cells/commit/0058d0ad7e2ba68618f9a40b7bc7ac853e60c2be): Skip internal events in activity subscriber
- [#369f75b](https://github.com/pydio/cells/commit/369f75b970b049184aad8d6087416dce1159d637): Folder-size-cache: remove unnecessary subscriber
- [#ab64685](https://github.com/pydio/cells/commit/ab64685599104b81b94acd1876a09a9ab9763669): Mime extractor on multipart : force LEAF on node to avoid display issue
- [#44df03f](https://github.com/pydio/cells/commit/44df03fbdead2143aa5743e64a13110097d1ae75): Next development cycle
- [#e5a145a](https://github.com/pydio/cells/commit/e5a145a206a8050206ca2d3e1aafb66b14958a42): Rate limiting
