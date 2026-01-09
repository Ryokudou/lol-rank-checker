const axios = require('axios');

module.exports = async (req, res) => {
    // 自分のAPIのエンドポイント(/api/riot/)を除去して、ターゲットのパスを取得
    // 例: /api/riot/jp1.api.riotgames.com/lol/... -> jp1.api.riotgames.com/lol/...
    const urlPath = req.url.replace(/^\/api\/riot\//, '');
    
    // index.html側で https:// を除外して送ってきている場合、ここで付与
    // URLとして成立させる
    const targetUrl = urlPath.startsWith('http') ? urlPath : `https://${urlPath}`;

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            },
            // クエリパラメータがあればそのまま転送
            params: req.query
        });

        // 成功時のレスポンス
        res.status(200).json(response.data);

    } catch (error) {
        // エラーハンドリング
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { message: error.message };
        
        console.error(`Error proxying to ${targetUrl}:`, status);
        res.status(status).json(data);
    }
};