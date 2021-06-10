import { h, render } from "https://cdn.skypack.dev/preact"
import { useState, useEffect } from "https://cdn.skypack.dev/preact/hooks"
import htm from "https://cdn.skypack.dev/htm"

const html = htm.bind(h)

export { render, html, useEffect, useState }