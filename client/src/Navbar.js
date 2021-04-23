import React, { Component } from 'react'

class Navbar extends Component {

  render() {
    return (
		<nav class="navbar navbar-expand-md navbar-light  shadow-sm" >
		<div class="container-fluid" >
			<div>
				<a href="https://cbr.ru/press/event/?id=8177" target="_blank" rel="noopener noreferrer" class="navbar-brad" style={{'text-decoration':'none'}}>artoken</a>
		
				<div style={{'margin-left':'0px','position':'static', 'text-align':'right'}}>
					<a  href={this.props.linkforether} style={{"text-decoration":"none","color":"black"}} target="_blank" rel="noopener noreferrer" class="navbar-adr">Your address: {this.props.short}</a>
				</div>
			</div>
			
			<button class="navbar-toggler" data-toggle="collapse" data-target="#navbarResponsive" style={{'border':'none'}}>
				<div class="menu" onclick="this.classList.toggle('opened');this.setAttribute('aria-expanded', this.classList.contains('opened'))" aria-label="Main Menu">
					<svg width="30" height="30" viewBox="0 0 100 100">
						<path class="line line1" d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058" />
						<path class="line line2" d="M 20,50 H 80" />
						<path class="line line3" d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942" />
					</svg>
				</div>
			</button>
			<div class="collapse navbar-collapse" id="navbarResponsive">
				<ul class="navbar-nav ml-auto">
					<li class="nav-item active">
						<a href="https://artoken.ru/client" class="nav-link" style={{'box-sizing': 'content-box'}}>Главная</a>
					</li>
					<li class="nav-item active">
						<a href="https://artoken.ru/" class="nav-link" style={{'box-sizing': 'content-box'}}>Аукционы</a>
					</li>
					<li class="nav-item active">
						<a href="https://bsc.artoken.ru/" class="nav-link" style={{'color':'#fff', 'background-color':'#277cfd', 'box-sizing': 'content-box'}}>Смарт-контракт</a>
					</li>
				</ul>
			</div>
	  </div>
	</nav>
    );
  }
}

export default Navbar;