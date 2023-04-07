import * as express from "express"

const { default: axios } = require("axios");
const Posts = require("../models/posts");

exports.alerts = async (req, res, next) => {};

exports.events = async (req, res, next) => {};

exports.schedule = async (req, res, next) => {};

exports.events.like = async (req, res, next) => {};

exports.events.dislike = async (req, res, next) => {};

exports.notices.like = async (req, res, next) => {};

exports.notices.dislike = async (req, res, next) => {};

exports.events.행사글id = async (req, res, next) => {};

exports.notices.공지글id = async (req, res, next) => {};

exports.alerts.공지글id = async (req, res, next) => {};

exports.notices = async (req, res, next) => {};
