

import axios from 'axios';

export async function getOEmbed(req, res) {
    const { videoUrl } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ message: 'Video URL is required' });
    }

    try {
        const response = await axios.get(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`);
        res.status(200).json({ html: response.data.html }); // Devuelve el HTML oEmbed
    } catch (error) {
        res.status(500).json({ message: 'Error fetching oEmbed data', error: error.message });
    }
}
