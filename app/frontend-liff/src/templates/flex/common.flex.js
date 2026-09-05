// src/templates/flex/components/common.flex.js

/**
 * Remove undefined/null values.
 * LINE Flex JSON ไม่ควรใส่ property ที่ไม่มีค่าโดยไม่จำเป็น
 */
function clean(object) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );
}

/**
 * สร้าง Flex message wrapper
 *
 * contents รองรับ bubble หรือ carousel
 */
function flex(altText, contents) {
  return {
    type: "flex",
    altText: String(altText || ""),
    contents,
  };
}

/**
 * สร้าง Bubble
 */
function bubble({
  size = "mega",
  header,
  hero,
  body = [],
  footer,
  styles,
  direction,
} = {}) {
  const result = {
    type: "bubble",
    size,
  };

  if (direction) {
    result.direction = direction;
  }

  if (header) {
    result.header = header;
  }

  if (hero) {
    result.hero = hero;
  }

  if (body) {
    result.body = isBox(body)
      ? body
      : box({
          layout: "vertical",
          contents: body,
          spacing: "sm",
        });
  }

  if (footer) {
    result.footer = isBox(footer)
      ? footer
      : box({
          layout: "vertical",
          contents: footer,
          spacing: "sm",
        });
  }

  if (styles) {
    result.styles = styles;
  }

  return result;
}

function isBox(value) {
  return value?.type === "box";
}

/**
 * สร้าง Box แนวนอน/แนวตั้ง
 */
function box({
  layout = "vertical",
  contents = [],
  spacing,
  margin,
  flex,
  alignItems,
  justifyContent,
  paddingAll,
  paddingTop,
  paddingBottom,
  paddingStart,
  paddingEnd,
  backgroundColor,
  cornerRadius,
  width,
  height,
  action,
} = {}) {
  return clean({
    type: "box",
    layout,
    contents: Array.isArray(contents) ? contents : [],
    spacing,
    margin,
    flex,
    alignItems,
    justifyContent,
    paddingAll,
    paddingTop,
    paddingBottom,
    paddingStart,
    paddingEnd,
    backgroundColor,
    cornerRadius,
    width,
    height,
    action,
  });
}

/**
 * Text component
 */
function text({
  text: value = "",
  size = "sm",
  color = "#222222",
  weight,
  align,
  wrap = true,
  maxLines,
  flex,
  margin,
  gravity,
  style,
  action,
} = {}) {
  return clean({
    type: "text",
    text: String(value),
    size,
    color,
    weight,
    align,
    wrap,
    maxLines,
    flex,
    margin,
    gravity,
    style,
    action,
  });
}

/**
 * Image component
 */
function image({
  url = "",
  size = "full",
  aspectRatio = "20:13",
  aspectMode = "cover",
  align,
  gravity,
  flex,
  margin,
  action,
} = {}) {
  return clean({
    type: "image",
    url,
    size,
    aspectRatio,
    aspectMode,
    align,
    gravity,
    flex,
    margin,
    action,
  });
}

/**
 * Button component
 */
function button({
  action = {},
  style = "primary",
  height = "sm",
  color,
  margin = "md",
  flex,
  gravity,
} = {}) {
  return clean({
    type: "button",
    action,
    style,
    height,
    color,
    margin,
    flex,
    gravity,
  });
}

/**
 * Separator
 */
function separator(margin = "sm") {
  return clean({
    type: "separator",
    margin,
  });
}

/**
 * Logo
 */
function logo({
  url = "https://profile.line-scdn.net/0h-n9lwDPCckEEFW5dL0INFjhQfCxzO3QJfHNpInZHfyIoJDdAaCY7dCdFK3d9JmIXayc6JiAcJXko",
  size = "full",
  aspectRatio = "20:8",
  paddingBottom = "sm",
} = {}) {
  return box({
    layout: "vertical",
    contents: [
      image({
        url,
        size,
        aspectRatio,
        aspectMode: "fit",
        align: "center",
        gravity: "center",
      }),
    ],
    alignItems: "center",
    paddingBottom,
  });
}

/**
 * Title
 */
function title(value, options = {}) {
  return text({
    text: value,
    size: options.size || "lg",
    color: options.color || "#000000",
    weight: "bold",
    align: options.align || "center",
    wrap: options.wrap ?? true,
    margin: options.margin || "xs",
  });
}

/**
 * Subtitle
 */
function subtitle(value, options = {}) {
  return text({
    text: value,
    size: options.size || "sm",
    color: options.color || "#1DB446",
    weight: options.weight,
    align: options.align || "center",
    wrap: options.wrap ?? true,
    margin: options.margin || "xs",
  });
}

/**
 * Note text
 */
function note(value, options = {}) {
  return text({
    text: value,
    size: options.size || "xs",
    color: options.color || "#8c8c8c",
    align: options.align || "center",
    wrap: options.wrap ?? true,
    margin: options.margin || "sm",
  });
}

/**
 * Info row แบบ label/value
 *
 * ตัวอย่างการแสดงผล:
 * บริการ1  ตัวอย่าง1.1
 * บริการ2  ตัวอย่าง2.1
 *        ตัวอย่าง2.2
 */
function infoRow({
  label = {},
  value = {},
  layout = "horizontal",
  justifyContent,
  spacing = "sm",
  margin = "sm",
} = {}) {
  const labelText = text({
    text: label.text,
    size: label.size || "sm",
    color: label.color || "#6f6f6f",
    align: label.align || "start",
    weight: label.weight,
    wrap: label.wrap ?? true,
    flex: layout === "horizontal" ? label.flex || 2 : undefined,
  });

  const valueText = text({
    text: value.text,
    size: value.size || "sm",
    color: value.color || "#222222",
    align: value.align || "start",
    weight: value.weight,
    wrap: value.wrap ?? true,
    flex: layout === "horizontal" ? value.flex || 4 : undefined,
  });

  return box({
    layout,
    contents: [labelText, valueText],
    spacing,
    justifyContent,
    margin,
  });
}

/**
 * Bullet row
 *
 * ตัวอย่างการแสดงผล:
 * • ตัวอย่าง1
 * • ตัวอย่าง2
 */
function bullet(value, options = {}) {
  return box({
    layout: "horizontal",
    spacing: options.spacing || "sm",
    margin: options.margin || "sm",
    contents: [
      text({
        text: options.symbol || "•",
        size: options.symbolSize || "sm",
        color: options.symbolColor || "#111111",
        flex: 0,
      }),
      text({
        text: value,
        size: options.size || "sm",
        color: options.color || "#111111",
        wrap: true,
        flex: 1,
      }),
    ],
  });
}

/**
 * Numbered row
 *
 * ตัวอย่างการแสดงผล:
 * 1. ตัวอย่าง1
 * 2. ตัวอย่าง2
 */
function numberedRow(number, label, value) {
  const contents = [
    text({
      text: `${number}.`,
      size: "sm",
      color: "#6f6f6f",
      flex: 0,
    }),
    text({
      text: label,
      size: "sm",
      color: value ? "#6f6f6f" : "#222222",
      wrap: true,
      flex: value ? 3 : 6,
    }),
  ];

  if (value !== undefined && value !== null && value !== "") {
    contents.push(
      text({
        text: value,
        size: "sm",
        color: "#222222",
        wrap: true,
        flex: 4,
      }),
    );
  }

  return box({
    layout: "horizontal",
    spacing: "sm",
    margin: "sm",
    contents,
  });
}

/**
 * Header แบบมาตรฐาน
 */
function standardHeader({
  logoUrl,
  title: titleValue,
  subtitle: subtitleValue,
  logoAspectRatio,
  titleColor,
  subtitleColor,
} = {}) {
  const contents = [];

  if (logoUrl) {
    contents.push(
      logo({
        url: logoUrl,
        aspectRatio: logoAspectRatio,
      }),
    );
  }

  if (titleValue) {
    contents.push(
      title(titleValue, {
        color: titleColor,
      }),
    );
  }

  if (subtitleValue) {
    contents.push(
      subtitle(subtitleValue, {
        color: subtitleColor,
      }),
    );
  }

  return box({
    layout: "vertical",
    contents,
    spacing: "sm",
    paddingBottom: "md",
  });
}

/**
 * Footer text แบบมาตรฐาน
 */
function standardFooter(footerText) {
  return box({
    layout: "vertical",
    contents: [
      text({
        text:
          footerText ||
          `Copyright © ${new Date().getFullYear()} Inverz Solutions Co., Ltd.`,
        size: "xxs",
        color: "#8c8c8c",
        align: "center",
        wrap: true,
      }),
    ],
  });
}

/**
 * สร้าง Bubble มาตรฐานพร้อม header/body/footer
 */
function standardBubble({
  logoUrl,
  title: titleValue,
  subtitle: subtitleValue,
  contents = [],
  footerText,
  hero,
  size = "mega",
} = {}) {
  return bubble({
    size,
    header: standardHeader({
      logoUrl,
      title: titleValue,
      subtitle: subtitleValue,
    }),
    hero,
    body: [separator("sm"), ...contents],
    footer: standardFooter(footerText),
  });
}

/**
 * Quick reply buttons
 * 
 * @param {string[]} buttons - Array of button labels
 * @returns {object} - Quick reply message object
 */

export {
  flex,
  bubble,
  box,
  text,
  image,
  button,
  separator,
  logo,
  title,
  subtitle,
  note,
  infoRow,
  bullet,
  numberedRow,
  standardHeader,
  standardFooter,
  standardBubble,
};
