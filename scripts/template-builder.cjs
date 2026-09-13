const fs = require('fs');
const path = require('path');

// Canonical section keys and blueprint from blog-7
const SECTION_HERO = "177868548039dc52a1";
const SECTION_INTRO = "blogtextliquid_LBJgtB";
const SECTION_TAKEAWAY = "177868816090d620d4";
const SECTION_BRIDGE = "blogtextliquid_ra7Awx";
const SECTION_COMPARISON = "blocks_ji7beH";
const SECTION_DEEP_DIVE = "1778690749e24fd023";
const SECTION_TABLE = "1780925695be0a3de2";
const SECTION_ADVICE = "17786893180b60ea14";
const SECTION_OUTRO = "1778692264fe7b6973";
const SECTION_GRID = "1778701783b132082f";

const ORDER = [
  SECTION_HERO,
  SECTION_INTRO,
  SECTION_TAKEAWAY,
  SECTION_BRIDGE,
  SECTION_COMPARISON,
  SECTION_DEEP_DIVE,
  SECTION_TABLE,
  SECTION_ADVICE,
  SECTION_OUTRO,
  SECTION_GRID
];

function createTemplate(blogData) {
  return {
    "sections": {
      [SECTION_HERO]: {
        "type": "_blocks",
        "blocks": {
          "ai_gen_block_0232e4c_37U8Va": {
            "type": "ai_gen_block_0232e4c",
            "settings": {
              "heading": `<p>${blogData.hero.heading}</p>`,
              "heading_size": 48,
              "mobile_heading_size": 24,
              "heading_line_height": 1.1,
              "heading_color": "#1a1a1a",
              "paragraph": `<p>${blogData.hero.paragraph}</p>`,
              "paragraph_size": 18,
              "mobile_paragraph_size": 16,
              "paragraph_line_height": 1.4,
              "paragraph_color": "#332F2B",
              "desktop_image": blogData.hero.image,
              "image_aspect_ratio": "16/9",
              "horizontal_alignment": "flex-start",
              "vertical_alignment": "center",
              "text_alignment": "left",
              "content_padding": 40,
              "content_max_width_inner": 680,
              "mobile_horizontal_alignment": "flex-start",
              "mobile_vertical_alignment": "center",
              "mobile_text_alignment": "left",
              "mobile_content_padding": 25,
              "content_max_width": 1400,
              "outer_spacing": 0,
              "mobile_outer_spacing": 0,
              "background_color": "#FAF8F5"
            },
            "blocks": {}
          }
        },
        "block_order": [
          "ai_gen_block_0232e4c_37U8Va"
        ],
        "custom_css": [],
        "settings": {}
      },
      [SECTION_INTRO]: {
        "type": "blogtextliquid",
        "custom_css": [],
        "name": "Blog Text Liquid",
        "settings": {
          "text_content": blogData.intro.text
        }
      },
      [SECTION_TAKEAWAY]: {
        "type": "_blocks",
        "blocks": {
          "ai_gen_block_a1afcd9_GyikqF": {
            "type": "ai_gen_block_a1afcd9",
            "settings": {
              "background_image": blogData.takeaway.image,
              "outer_border_color": "#FAF8F5",
              "outer_border_px": 0,
              "aspect_ratio": 56,
              "font_family_regular": "'PP Editorial New', 'Cormorant Garamond', Georgia, serif",
              "font_family_italic": "'PPEditorialNew Ultralight Italic', 'Cormorant Garamond', Georgia, serif",
              "text_color": "#ffffff",
              "text_line_1": "",
              "line1_top": 66,
              "line1_left": 19,
              "brand_name_regular": "",
              "brand_name_italic": blogData.takeaway.title || "THE SHORT VERSION",
              "brand_top": 6,
              "brand_left": 50,
              "text_line_2": "",
              "line3_top": 87,
              "line3_left": 63
            },
            "blocks": {}
          }
        },
        "block_order": [
          "ai_gen_block_a1afcd9_GyikqF"
        ],
        "settings": {}
      },
      [SECTION_BRIDGE]: {
        "type": "blogtextliquid",
        "custom_css": [],
        "name": "Blog Text Liquid",
        "settings": {
          "text_content": blogData.bridge.text
        }
      },
      [SECTION_COMPARISON]: {
        "type": "_blocks",
        "blocks": {
          "ai_gen_block_614820f_zNd6WG": {
            "type": "ai_gen_block_614820f",
            "settings": {
              "heading": blogData.comparison.heading,
              "heading_size": 42,
              "heading_size_mobile": 28,
              "heading_line_height": 1.1,
              "heading_color": "#1A1816",
              "heading_margin_bottom": 30,
              "heading_margin_bottom_mobile": 25,
              "column_1_text": blogData.comparison.col1,
              "column_2_text": blogData.comparison.col2,
              "body_size": 17,
              "body_size_mobile": 15,
              "body_line_height": 1.9,
              "body_color": "#2D2A26",
              "paragraph_spacing": 20,
              "column_gap": 55,
              "column_gap_mobile": 30,
              "max_width": 1100,
              "desktop_width_percent": 100,
              "background_color": "#FAF8F5",
              "padding_top": 60,
              "padding_bottom": 60,
              "padding_horizontal": 40,
              "padding_top_mobile": 40,
              "padding_bottom_mobile": 40,
              "padding_horizontal_mobile": 20
            },
            "blocks": {}
          }
        },
        "block_order": [
          "ai_gen_block_614820f_zNd6WG"
        ],
        "name": "Editorial text section",
        "settings": {}
      },
      [SECTION_DEEP_DIVE]: {
        "type": "_blocks",
        "blocks": {
          "ai_gen_block_fb81b45_9nTtAA": {
            "type": "ai_gen_block_fb81b45",
            "settings": {
              "desktop_width_percent": 100,
              "max_width": 1100,
              "section_padding": 60,
              "background_color": "#FAF8F5",
              "heading": `<p>${blogData.deepDive.heading}</p>`,
              "heading_size": 42,
              "heading_color": "#1A1816",
              "heading_spacing": 25,
              "box_color": "#1C1917",
              "box_radius": 15,
              "box_padding": 45,
              "box_spacing": 35,
              "box_paragraph_1": blogData.deepDive.boxText,
              "box_paragraph_2": "",
              "box_paragraph_3": "",
              "box_text_color": "#F5EFE6",
              "box_text_size": 17,
              "box_text_line_height": 1.9,
              "paragraph_spacing": 20,
              "subheading": `<p>${blogData.deepDive.subheading}</p>`,
              "subheading_size": 42,
              "subheading_color": "#1A1816",
              "subheading_spacing": 40,
              "bottom_text": blogData.deepDive.bottomText,
              "bottom_text_size": 17,
              "bottom_text_color": "#2D2A26",
              "bottom_text_line_height": 1.9
            },
            "blocks": {}
          }
        },
        "block_order": [
          "ai_gen_block_fb81b45_9nTtAA"
        ],
        "settings": {}
      },
      [SECTION_TABLE]: {
        "type": "_blocks",
        "blocks": {
          "ai_gen_block_e9499a3_nQznTw": {
            "type": "ai_gen_block_e9499a3",
            "settings": {
              "header_1": blogData.table.h1,
              "header_2": blogData.table.h2,
              "header_3": blogData.table.h3,
              "row_1_label": blogData.table.r1Label,
              "row_1_col_1": blogData.table.r1c1,
              "row_1_col_2": blogData.table.r1c2,
              "row_1_col_3": blogData.table.r1c3,
              "row_2_label": blogData.table.r2Label,
              "row_2_col_1": blogData.table.r2c1,
              "row_2_col_2": blogData.table.r2c2,
              "row_2_col_3": blogData.table.r2c3,
              "row_3_label": blogData.table.r3Label,
              "row_3_col_1": blogData.table.r3c1,
              "row_3_col_2": blogData.table.r3c2,
              "row_3_col_3": blogData.table.r3c3,
              "row_4_label": blogData.table.r4Label,
              "row_4_col_1": blogData.table.r4c1,
              "row_4_col_2": blogData.table.r4c2,
              "row_4_col_3": blogData.table.r4c3,
              "side_padding": 20,
              "cell_padding": 18,
              "label_font_weight": "bold",
              "header_bg_color": "#1A1816",
              "header_text_color": "#F8F5F0",
              "row_bg_color": "#FAF8F5",
              "body_text_color": "#383430",
              "border_color": "rgba(0,0,0,0.06)",
              "table_bg_color": "#FAF8F5"
            },
            "blocks": {}
          }
        },
        "block_order": [
          "ai_gen_block_e9499a3_nQznTw"
        ],
        "settings": {}
      },
      [SECTION_ADVICE]: {
        "type": "_blocks",
        "blocks": {
          "ai_gen_block_c88e324_m8PFU4": {
            "type": "ai_gen_block_c88e324",
            "settings": {
              "container_width": 1100,
              "left_column_width": 45,
              "right_column_width": 55,
              "column_gap": 50,
              "desktop_width_percent": 100,
              "heading": "What this means when you are shopping",
              "heading_font": "serif",
              "heading_size": 42,
              "mobile_heading_size": 28,
              "heading_color": "#1A1816",
              "heading_indent": 0,
              "mobile_heading_indent": 0,
              "image": blogData.advice.image,
              "image_max_width": 500,
              "heading_image_gap": 16,
              "mobile_heading_image_gap": 20,
              "body_text": blogData.advice.text,
              "body_font": "system_ui_n4",
              "body_size": 17,
              "mobile_body_size": 15,
              "body_color": "#2D2A26",
              "paragraph_spacing": 20,
              "mobile_paragraph_spacing": 15,
              "text_vertical_offset": 0,
              "background_color": "#FAF8F5",
              "padding_top": 60,
              "padding_bottom": 60,
              "horizontal_padding": 30,
              "mobile_padding_top": 40,
              "mobile_padding_bottom": 40,
              "mobile_horizontal_padding": 20,
              "mobile_gap": 30
            },
            "blocks": {}
          }
        },
        "block_order": [
          "ai_gen_block_c88e324_m8PFU4"
        ],
        "settings": {}
      },
      [SECTION_OUTRO]: {
        "type": "_blocks",
        "blocks": {
          "ai_gen_block_e9ac98b_QF8teC": {
            "type": "ai_gen_block_e9ac98b",
            "settings": {
              "container_width": 1100,
              "horizontal_padding": 30,
              "padding_top": 60,
              "padding_bottom": 60,
              "column_gap": 50,
              "mobile_gap": 25,
              "mobile_scale": 0.7,
              "background_color": "#FAF8F5",
              "prefix_text": "ONE MORE",
              "prefix_font_size": 38,
              "brand_scent_text": "",
              "brand_spired_text": "",
              "brand_font_size": 38,
              "start_text": "",
              "start_font_size": 38,
              "bestsellers_text": "THING",
              "bestsellers_font_size": 38,
              "heading_line_spacing": 4,
              "heading_line_height": 1.1,
              "heading_color": "#1A1816",
              "body_text": blogData.outro.text,
              "body_font_size": 17,
              "body_line_height": 1.8,
              "body_color": "#2D2A26"
            },
            "blocks": {}
          }
        },
        "block_order": [
          "ai_gen_block_e9ac98b_QF8teC"
        ],
        "custom_css": [],
        "settings": {}
      },
      [SECTION_GRID]: {
        "type": "_blocks",
        "blocks": {
          "ai_gen_block_29a8932_icikjA": {
            "type": "ai_gen_block_29a8932",
            "settings": {
              "collection": "bestsellers"
            },
            "blocks": {}
          }
        },
        "block_order": [
          "ai_gen_block_29a8932_icikjA"
        ],
        "settings": {}
      }
    },
    "order": ORDER
  };
}

module.exports = { createTemplate, ORDER };
