// api/spotify.js

const getAccessToken = async () => {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  const data = await res.json();
  return data.access_token;
};

module.exports = async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 204 || response.status >= 400) {
      return res.status(200).json({ isPlaying: false });
    }

    const song = await response.json();

    res.status(200).json({
      isPlaying: true,
      title: song.item.name,
      artist: song.item.artists.map((a) => a.name).join(", "),
    });
  } catch (err) {
    console.error("Spotify API error:", err);
    res.status(200).json({ isPlaying: false });
  }
};