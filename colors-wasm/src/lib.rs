mod utils;

use serde_derive::{Deserialize, Serialize};
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;
use web_sys::console;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Deserialize, Serialize)]
struct Color {
    r: i32,
    g: i32,
    b: i32,
}

#[wasm_bindgen]
pub fn find_colors(color_data: JsValue, k_clusters: JsValue) -> JsValue {
    set_panic_hook();

    let colors: Vec<Color> = serde_wasm_bindgen::from_value(color_data).unwrap();
    let mut clusters: Vec<Color> = serde_wasm_bindgen::from_value(k_clusters).unwrap();

    let mut iterations = 0;
    let mut distance_shift = 0_f32;

    loop {
        console::time_with_label("Calc new clusters");
        let new_clusters = calc_new_clusters(&clusters, &colors);
        console::time_end_with_label("Calc new clusters");

        console::time_with_label("Calc distance shift");
        for i in 0..new_clusters.len() {
            distance_shift += calc_euclidean_dist(&new_clusters[i], &clusters[i])
        }
        console::time_end_with_label("Calc distance shift");

        distance_shift /= new_clusters.len() as f32;

        clusters = new_clusters;

        if distance_shift <= 5_f32 || iterations >= 10 {
            break;
        }

        iterations += 1;
        distance_shift = 0_f32;
    }

    JsValue::from(
        clusters
            .iter()
            .map(|c| format!("#{:02x}{:02x}{:02x}", c.r, c.g, c.b))
            .map(|s| JsValue::from(&s[..]))
            .collect::<js_sys::Array>(),
    )
}

fn calc_new_clusters(k_clusters: &Vec<Color>, color_data: &Vec<Color>) -> Vec<Color> {
    let mut new_clusters = vec![vec![]; k_clusters.len()];

    for color in color_data {
        let distances = k_clusters
            .iter()
            .map(|k| calc_euclidean_dist(k, color))
            .collect::<Vec<f32>>();

        let min_distance = distances.iter().fold(f32::INFINITY, |a, &b| a.min(b));

        let selected_k = distances.iter().position(|&r| r == min_distance).unwrap();

        new_clusters[selected_k].push(color);
    }

    new_clusters
        .iter()
        .map(|c_list| {
            let mut r = 0;
            let mut b = 0;
            let mut g = 0;

            c_list.iter().for_each(|color| {
                r += color.r;
                b += color.b;
                g += color.g;
            });

            Color {
                r: (r / c_list.len() as i32),
                g: (g / c_list.len() as i32),
                b: (b / c_list.len() as i32),
            }
        })
        .collect()
}

fn calc_euclidean_dist(p: &Color, q: &Color) -> f32 {
    f32::sqrt((i32::pow(p.r - q.r, 2) + i32::pow(p.g - q.g, 2) + i32::pow(p.b - q.b, 2)) as f32)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_euclid_zero() {
        let result = calc_euclidean_dist(&Color { r: 0, g: 0, b: 0 }, &Color { r: 0, g: 0, b: 0 });

        assert_eq!(result, 0_f32);
    }

    #[test]
    fn test_euclid() {
        let result = calc_euclidean_dist(&Color { r: 1, g: 1, b: 0 }, &Color { r: 2, g: 1, b: 2 });

        assert_eq!(result, 2.236068_f32);
    }
}
