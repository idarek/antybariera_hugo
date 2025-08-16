<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
                xmlns:media="http://search.yahoo.com/mrss/">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> Web Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width"/>
        <style type="text/css">
        body {
          font-size: 16px;
          font-family:
            system-ui,
            'Segoe UI',
            Roboto,
            Helvetica,
            Arial,
            sans-serif,
            'Apple Color Emoji',
            'Segoe UI Emoji';
        }
        .recent {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem auto;
        }
        .head {
          font-size: 1rem;
        }
        .item {
          margin: 1rem auto;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .thumbnail img {
          max-width: 150px;
          height: auto;
          border-radius: 8px;
        }
        .published {
          margin: 0.2rem auto;
        }
        </style>
      </head>
      <body>
        <div>
          <header>
            <h1>
              <svg width="1em" height="1em" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><path d="M493 652H392c0-134-111-244-244-244V307c189 0 345 156 345 345zm71 0c0-228-188-416-416-416V132c285 0 520 235 520 520z"/><circle cx="219" cy="581" r="71"/></svg>
              RSS Feed —
              <a target="_blank">
                <xsl:attribute name="href">
                  <xsl:value-of select="/rss/channel/link"/>
                </xsl:attribute>
                <xsl:value-of select="/rss/channel/title"/>
              </a>
            </h1>
          </header>
          <div class="recent">Recent Items</div>
          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <xsl:if test="media:thumbnail">
                <div class="thumbnail">
                  <img>
                    <xsl:attribute name="src">
                      <xsl:value-of select="media:thumbnail/@url"/>
                    </xsl:attribute>
                    <xsl:attribute name="alt">
                      <xsl:value-of select="title"/>
                    </xsl:attribute>
                  </img>
                </div>
              </xsl:if>
              <div class="content">
                <div class="head">
                  <strong>
                    <a target="_blank">
                      <xsl:attribute name="href">
                        <xsl:value-of select="link"/>
                      </xsl:attribute>
                      <xsl:value-of select="title"/>
                    </a>
                  </strong>
                </div>
                <div class="published">
                  Published: <xsl:value-of select="pubDate" />
                </div>
              </div>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>